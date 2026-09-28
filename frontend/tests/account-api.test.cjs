const test = require("node:test"),
  assert = require("node:assert/strict"),
  ts = require("typescript"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path");
function fixture(authToken, fetch) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "../lib/account-api.ts"), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    require: (id) =>
      id === "./auth-client"
        ? { authClient: { token: authToken } }
        : { apiBase: "http://fixture.test" },
    fetch,
    Headers,
    AbortSignal,
    Date,
    Error,
  });
  return exports;
}
test("a token acquired for a previous session is never sent or cached after account change", async () => {
  let resolve,
    calls = 0,
    headers = [];
  const api = fixture(
    () =>
      ++calls === 1
        ? new Promise((r) => (resolve = r))
        : Promise.resolve({ data: { token: "new" } }),
    async (_, init) => {
      headers.push(init.headers.get("Authorization"));
      return { status: 200 };
    },
  );
  const old = api.accountFetch("/wallet");
  api.clearAccountToken();
  resolve({ data: { token: "old" } });
  await assert.rejects(old, /session changed/);
  await api.accountFetch("/wallet");
  assert.deepEqual(headers, ["Bearer new"]);
});
test("an old unauthorized write cannot retry under a newly signed-in account", async () => {
  let resolve,
    sent = 0;
  const api = fixture(
    async () => ({ data: { token: "old" } }),
    () => {
      sent++;
      return new Promise((r) => (resolve = r));
    },
  );
  const old = api.accountFetch("/deposits", { method: "POST", body: "{}" });
  await new Promise((r) => setImmediate(r));
  api.clearAccountToken();
  resolve({ status: 401 });
  await assert.rejects(old, /session changed/);
  assert.equal(sent, 1);
});
test("a normal expired token retries the same request once with a new token", async () => {
  let token = 0;
  const sent = [];
  const api = fixture(
    async () => ({ data: { token: String(++token) } }),
    async (_, init) => {
      sent.push({ auth: init.headers.get("Authorization"), body: init.body });
      return { status: sent.length === 1 ? 401 : 200 };
    },
  );
  assert.equal(
    (await api.accountFetch("/deposits", { method: "POST", body: "original" }))
      .status,
    200,
  );
  assert.deepEqual(sent, [
    { auth: "Bearer 1", body: "original" },
    { auth: "Bearer 2", body: "original" },
  ]);
});
