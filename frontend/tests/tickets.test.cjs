const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const JSZip = require('jszip');
function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const m = new Module(filename, module); m.filename = filename; m.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = m.require.bind(m);
  m.require = id => overrides[id] || (id.startsWith('@/') ? load(`${id.slice(2)}.ts`, overrides) : id.startsWith('.') ? load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${id}.ts`)), overrides) : original(id));
  m._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true}}).outputText, filename);
  return m.exports;
}
const {playersWorkbook, reviewArchive, screenshotFilename} = load('lib/exports/players.ts');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
test('retired guest purchase and availability routes cannot write to Sanity', async()=> {for(const [path,method] of [['entries/submit','POST'],['entries/availability','GET']]) {const route=load(`app/api/${path}/route.ts`);assert.equal((await route[method](new Request('https://test'))).status,410)}});
const entries=[{_id:'private.entry.one',playerName:'=HYPERLINK("bad") & አበበ',playerPhone:'0911000000',paymentReference:'+123456',amount:100,luckyNumber:'0007',imageUrl:'https://cdn.sanity.io/test.png',mimeType:'image/png'}, {_id:'private.entry.two',playerName:'Second',imageUrl:'https://cdn.sanity.io/missing.jpg'}];
test('Excel is an actual XLSX archive with text-safe phone, numbers and formulas',async()=>{
  const data=await playersWorkbook(entries);const zip=await JSZip.loadAsync(data);const sheet=await zip.file('xl/worksheets/sheet1.xml').async('string');
  assert.ok(zip.file('[Content_Types].xml'));assert.match(sheet,/<c r="C2" t="inlineStr"><is><t xml:space="preserve">0911000000/);assert.ok(sheet.includes('=HYPERLINK(&quot;bad&quot;) &amp; አበበ'));assert.ok(!sheet.includes('<f>'));assert.ok(sheet.includes('0007'));assert.ok(sheet.includes(screenshotFilename(entries[0])));
  if(process.env.EXPORT_TEST_FILE)fs.writeFileSync(process.env.EXPORT_TEST_FILE,data);
});
test('ZIP pairs Excel rows with screenshots and reports each failed download',async(t)=>{
  const original=global.fetch;t.after(()=>global.fetch=original);global.fetch=async url=>url.includes('missing')?new Response('',{status:404}):new Response(png);
  const {data,failures}=await reviewArchive(entries);const zip=await JSZip.loadAsync(data);
  assert.equal(failures.length,1);assert.ok(zip.file(screenshotFilename(entries[0])));assert.equal(zip.file(screenshotFilename(entries[1])),null);
  const xlsx=await JSZip.loadAsync(await zip.file('players.xlsx').async('uint8array'));const sheet=await xlsx.file('xl/worksheets/sheet1.xml').async('string');assert.ok(sheet.includes('Included'));assert.ok(sheet.includes('Failed — retry download'));assert.match(await zip.file('README.txt').async('string'),/private.entry.two: HTTP 404/);
});

