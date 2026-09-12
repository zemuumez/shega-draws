const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = m.require.bind(m);
  m.require = id => id.startsWith('@/') ? load(`${id.slice(2)}.ts`) : id === './backend-proxy' ? load('lib/server/backend-proxy.ts') : original(id);
  m._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename);
  return m.exports;
}
function mockFetch(t, handler) {
  const previous = global.fetch;
  global.fetch = handler;
  t.after(() => { global.fetch = previous; });
}
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });
function browser(t) {
  const previousWindow = global.window, previousStorage = global.localStorage;
  const values = new Map();
  global.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) };
  global.window = { dispatchEvent() {}, location: { href: '/entries' } };
  t.after(() => { global.window = previousWindow; global.localStorage = previousStorage; });
}

test('login proxy forwards the real session cookie with the website auth path', async t => {
  mockFetch(t, async (url, options) => {
    assert.match(url, /\/auth\/player-login$/);
    assert.equal(options.cache, 'no-store');
    assert.deepEqual(JSON.parse(Buffer.from(options.body).toString()), { phone: '0911234567', pin: '1234' });
    return json({ access_token: 'signed-token', user: { id: 'alice' } }, 200, {
      'Set-Cookie': 'refresh_token=refresh-jwt; Path=/api/v1/auth; Max-Age=3600; HttpOnly; Secure; SameSite=Strict',
    });
  });
  const { POST } = load('app/api/auth/login/route.ts');
  const res = await POST(new Request('https://lottery.test/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone: '0911234567', pin: '1234' }),
  }));
  assert.equal(res.status, 200);
  assert.match(res.headers.get('set-cookie'), /Path=\/api\/auth;/);
  assert.match(res.headers.get('set-cookie'), /HttpOnly/);
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('registration outages fail instead of inventing an account', async t => {
  mockFetch(t, async () => { throw new Error('offline'); });
  const { POST } = load('app/api/auth/register/route.ts');
  const res = await POST(new Request('https://lottery.test/api/auth/register', { method: 'POST', body: '{}' }));
  assert.equal(res.status, 503);
  assert.equal((await res.json()).access_token, undefined);
});

test('history drops client identity filters and leaves authorization to Go', async t => {
  mockFetch(t, async (url, options) => {
    assert.equal(new URL(url).search, '?draw_id=draw-1');
    assert.equal(options.headers.get('authorization'), 'Bearer forged');
    return json({ error: 'invalid token' }, 401);
  });
  const { GET } = load('app/api/entries/mine/route.ts');
  const res = await GET(new Request('https://lottery.test/api/entries/mine?phone=bob&user_id=bob&draw_id=draw-1', { headers: { authorization: 'Bearer forged' } }));
  assert.equal(res.status, 401);
});

test('me cannot authenticate an unsigned fallback token', async t => {
  mockFetch(t, async () => json({ error: 'invalid token' }, 401));
  const { GET } = load('app/api/auth/me/route.ts');
  const res = await GET(new Request('https://lottery.test/api/auth/me', { headers: { authorization: 'Bearer token_forged' } }));
  assert.equal(res.status, 401);
  assert.equal((await res.json()).user_id, undefined);
});

test('logout forwards only the refresh cookie and clears the same path', async t => {
  mockFetch(t, async (_url, options) => {
    assert.equal(options.headers.get('cookie'), 'refresh_token=real-refresh');
    return json({ message: 'logged out' }, 200, { 'Set-Cookie': 'refresh_token=; Path=/api/v1/auth; Max-Age=0; HttpOnly' });
  });
  const { POST } = load('app/api/auth/logout/route.ts');
  const res = await POST(new Request('https://lottery.test/api/auth/logout', { method: 'POST', headers: { cookie: 'unrelated=private; refresh_token=real-refresh' } }));
  assert.match(res.headers.get('set-cookie'), /Path=\/api\/auth;/);
  assert.match(res.headers.get('set-cookie'), /Max-Age=0/);
});

test('cross-origin session mutations are rejected before forwarding', async t => {
  mockFetch(t, async () => { assert.fail('must not forward cross-origin request'); });
  const { POST } = load('app/api/auth/logout/route.ts');
  const res = await POST(new Request('https://lottery.test/api/auth/logout', { method: 'POST', headers: { origin: 'https://attacker.test' } }));
  assert.equal(res.status, 403);
});

test('ticket history does not merge another account from local storage', async t => {
  browser(t);
  localStorage.setItem('rimnalottery_local_entries', JSON.stringify([{ id: 'bob-ticket' }]));
  mockFetch(t, async () => json([{ id: 'alice-ticket', user_id: 'alice' }]));
  const api = load('lib/api.ts');
  assert.deepEqual(await api.getMyEntries(), [{ id: 'alice-ticket', user_id: 'alice' }]);
});

test('purchase makes one authenticated submission and propagates rejection', async t => {
  browser(t); localStorage.setItem('rimnalottery_access_token', 'alice-jwt');
  let calls = 0;
  mockFetch(t, async (url, options) => {
    calls++; assert.equal(url, '/api/entries/submit');
    assert.equal(options.headers.get('authorization'), 'Bearer alice-jwt');
    return json({ error: 'draw is closed' }, 400);
  });
  const api = load('lib/api.ts');
  await assert.rejects(api.submitEntry(new FormData()), /draw is closed/);
  assert.equal(calls, 1);
});

test('concurrent expired requests share refresh and retry with the new access token', async t => {
  browser(t); localStorage.setItem('rimnalottery_access_token', 'expired');
  let refreshes = 0;
  mockFetch(t, async (url, options) => {
    if (url === '/api/auth/refresh') {
      refreshes++; await new Promise(resolve => setTimeout(resolve, 10));
      return json({ access_token: 'renewed' });
    }
    if (options.headers.get('authorization') === 'Bearer expired') return json({ error: 'expired' }, 401);
    assert.equal(options.headers.get('authorization'), 'Bearer renewed');
    return json([]);
  });
  const api = load('lib/api.ts');
  const result = await Promise.all([api.getMyEntries(), api.getMyEntries()]);
  assert.deepEqual(result, [[], []]); assert.equal(refreshes, 1);
  assert.equal(window.location.href, '/entries');
});

test('legacy receipt management rejects players before querying private records', async t => {
  mockFetch(t, async () => json({ id: 'alice', role: 'player' }));
  const { requireAdmin } = load('lib/server/require-admin.ts');
  const denied = await requireAdmin(new Request('https://lottery.test/api/admin/screenshots', { headers: { authorization: 'Bearer player-jwt' } }));
  assert.equal(denied.status, 403);
  const missing = await requireAdmin(new Request('https://lottery.test/api/admin/screenshots'));
  assert.equal(missing.status, 401);
});
