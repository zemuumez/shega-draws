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
const {isAllowedSelection, selectionKey, validNumber} = load('lib/tickets.ts');
const {createTicket, entryId, takenNumbers} = load('lib/server/tickets.ts');
const {playersWorkbook, reviewArchive, screenshotFilename} = load('lib/exports/players.ts');
const selection = {key:'RDL-ETB-100-25000', label:'RDL-ETB-100-25000', currency:'ETB', ticketPrice:100, poolCapacity:25000};
const settings = {_id:'settings', _rev:'1', etbPrices:[{value:100,isEnabled:true},{value:200,isEnabled:true}], usdPrices:[{value:25,isEnabled:true}], poolSizes:[{size:25000,isEnabled:true},{size:1000,isEnabled:true}], telebirrMerchantCode:'12345', diasporaWireInstructions:'Test transfer instructions'};
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
function form(number='25000', submissionId='b2c0901e-e9b3-43c9-bc43-88300a2a8fde') {
  const f = new FormData();
  for (const [k,v] of Object.entries({submission_id:submissionId, number, user_name:'አበበ Tesfaye', user_phone:'0911000000', amount:'100', currency:'ETB', pool_capacity:'25000', method:'telebirr', payment_reference:'TF123456'})) f.set(k,v);
  f.set('proof', new Blob([png], {type:'image/png'}), 'receipt.png'); return f;
}
function fakeClient({settingsValue=settings, legacy=[], failUpload=false, failCommit=false, afterCommitTimeout=false, onUpload}={}) {
  const docs = new Map(); let uploads=0;
  const conflict=()=>Object.assign(new Error('conflict'),{statusCode:409});
  const client = {docs, settings: structuredClone(settingsValue), get uploads(){return uploads;},
    async fetch(query, params){
      assert.ok(!query.includes('_type == "draw"'), 'Purchases must never require a draw document');
      if(query.includes('_type == "siteSettings"')) return structuredClone(client.settings);
      return [...legacy, ...docs.values()].filter(e=>e.currency===params.currency && e.amount===params.price);
    },
    async getDocument(id){return docs.get(id);},
    assets:{async upload(){uploads++; if(failUpload) throw new Error('upload offline');onUpload?.(client);return {_id:'image-proof'};}},
    transaction(){let created, expectedRev;const chain={patch(id, cb){assert.equal(id,'settings');cb({ifRevisionId(rev){expectedRev=rev;return this;},set(){return this;}});return chain;},create(doc){created=doc;return chain;},async commit(){
      if(failCommit) throw new Error('commit offline');
      if(docs.has(created._id)||expectedRev!==client.settings._rev)throw conflict();
      docs.set(created._id,created);client.settings._rev=String(Number(client.settings._rev)+1);
      if(afterCommitTimeout)throw new Error('timeout after save');return created;
    }};return chain;},
  }; return client;
}
test('published price and pool switches alone authorize ETB and USD tickets', () => {
  assert.equal(isAllowedSelection('ETB',100,25000,settings),true);
  assert.equal(isAllowedSelection('USD',25,25000,settings),true);
  for(const [currency,price,pool] of [['USD',100,25000],['EUR',100,25000],['ETB',100,1000000],['ETB',NaN,25000],['ETB',100,1.5]]) assert.equal(isAllowedSelection(currency,price,pool,settings),false);
  for(const s of [null,{}, {...settings,etbPrices:[{value:100,isEnabled:false}]},{...settings,poolSizes:[{size:25000,isEnabled:false}]}])assert.equal(isAllowedSelection('ETB',100,25000,s),false);
});
test('25K pool allows 1 and 25000 but not zero, 25001, fractions or expressions', () => {
  assert.ok(validNumber('1',25000));assert.ok(validNumber('25000',25000));
  for(const n of ['0','25001','1.5','1e3','-1','NaN','']) assert.equal(validNumber(n,25000),false);
});
test('guest can buy an enabled ticket without a draw ID or draw document', async () => {
  const client=fakeClient();const receipt=await createTicket(client,form());const doc=client.docs.get(receipt.id);
  assert.equal(receipt.status,'pending');assert.match(receipt.id,/^private\.entry\./);assert.equal(doc.playerPhone,'0911000000');assert.equal(doc.luckyNumber,'25000');assert.equal(doc.poolCapacity,'25000');assert.equal(doc.amount,100);assert.equal(doc.paymentReference,'TF123456');assert.equal(doc.proofScreenshot.asset._ref,'image-proof');assert.equal(doc.selectionKey,selection.key);assert.equal(doc.drawDocumentId,undefined);
});
test('25 USD / 25K checkout and submission succeed using the CMS switches', async () => {
  const client=fakeClient();const {GET}=load('app/api/entries/availability/route.ts', {'@/lib/sanity/client':{getSanityWriteClient:()=>client}});
  const response=await GET(new Request('https://example.test/api/entries/availability?currency=USD&price=25&pool=25000&draw_id=closed-old-draw'));
  assert.equal(response.status,200);assert.equal((await response.json()).selectionKey,'RDL-USD-25-25000');
  const f=form();f.set('currency','USD');f.set('amount','25');f.set('method','wire');f.set('draw_id','expired-old-draw');
  assert.equal((await createTicket(client,f)).status,'pending');
});
test('same request retry is idempotent after options are disabled or a response is lost', async () => {
  const client=fakeClient({afterCommitTimeout:true});const first=await createTicket(client,form());client.fetch=async()=>null;
  assert.deepEqual(await createTicket(client,form()),first);assert.equal(client.uploads,1);
  const changed=form();changed.set('user_name','Another Player');await assert.rejects(()=>createTicket(client,changed),/already been taken/);
});
test('simultaneous submissions can create only one receipt for a number', async () => {
  const client=fakeClient();const results=await Promise.allSettled([createTicket(client,form()),createTicket(client,form('25000','c2c0901e-e9b3-43c9-bc43-88300a2a8fde'))]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(client.docs.size,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
});
test('concurrent purchases of different numbers retry revision conflicts without duplicate uploads', async () => {
  const client=fakeClient();await Promise.all([createTicket(client,form('1')),createTicket(client,form('2','c2c0901e-e9b3-43c9-bc43-88300a2a8fde'))]);
  assert.equal(client.docs.size,2);assert.equal(client.uploads,2);
});
test('number reservations are separate for each currency, price and pool combination', async () => {
  const client=fakeClient();await createTicket(client,form('7'));
  for(const [currency,price,pool,method] of [['USD',25,25000,'wire'],['ETB',200,25000,'telebirr'],['ETB',100,1000,'telebirr']]){
    const f=form('7');f.set('currency',currency);f.set('amount',String(price));f.set('pool_capacity',String(pool));f.set('method',method);await createTicket(client,f);
  }
  assert.equal(client.docs.size,4);
  assert.notEqual(entryId(selectionKey('ETB',100,1000),'7'),entryId(selection.key,'7'));
});
test('forged prices, pools, payment methods, numbers, phone and non-images fail before upload', async () => {
  for(const [key,value] of [['amount','1'],['pool_capacity','50000'],['currency','EUR'],['method','card'],['number','25001'],['user_phone','notaphone'],['proof',new Blob(['<script>'],{type:'image/png'})]]) {
    const client=fakeClient();const f=form();f.set(key,value);await assert.rejects(()=>createTicket(client,f));assert.equal(client.uploads,0,key);
  }
});
test('missing settings, disabled tiers and storage failures never produce a successful ticket',async()=>{
  for(const options of [{settingsValue:null},{settingsValue:{...settings,poolSizes:[]}},{settingsValue:{...settings,etbPrices:[{value:100,isEnabled:false}]}},{failUpload:true},{failCommit:true}]){
    const client=fakeClient(options);await assert.rejects(()=>createTicket(client,form()));assert.equal(client.docs.size,0);
  }
});
test('disabling a pool during screenshot upload prevents the final booking',async()=>{
  const client=fakeClient({onUpload(c){c.settings.poolSizes[0].isEnabled=false;c.settings._rev='2';}});
  await assert.rejects(()=>createTicket(client,form()),/disabled/);assert.equal(client.docs.size,0);
});
test('legacy draw-linked receipts reserve numbers only in their matching price, currency and pool',async()=>{
  const client=fakeClient({legacy:[
    {currency:'ETB',amount:100,poolCapacity:'25,000 (25K)',luckyNumber:'07',playerName:'Secret'},
    {currency:'ETB',amount:100,poolCapacity:'1000',luckyNumber:'8'},
    {currency:'ETB',amount:100,poolCapacity:'25000',drawDocumentId:'old-draw',luckyNumber:'9',status:'rejected'},
    {currency:'USD',amount:100,poolCapacity:'25000',luckyNumber:'10'},
    {currency:'ETB',amount:200,poolCapacity:'25000',luckyNumber:'11'},
  ]});assert.deepEqual(await takenNumbers(client,selection),['7','9']);
});
test('public availability exposes numbers, not player details; disabled combinations still fail',async()=>{
  const client=fakeClient({legacy:[{currency:'ETB',amount:100,poolCapacity:'25000',luckyNumber:'7',playerName:'Secret',playerPhone:'0911'}]});
  const {GET}=load('app/api/entries/availability/route.ts', {'@/lib/sanity/client':{getSanityWriteClient:()=>client}});
  const url='https://example.test/api/entries/availability?currency=ETB&price=100&pool=25000';
  const response=await GET(new Request(url));const text=await response.text();
  assert.equal(response.status,200);assert.ok(!text.includes('Secret'));assert.ok(!text.includes('0911'));assert.equal(response.headers.get('cache-control'),'no-store');
  client.settings.poolSizes[0].isEnabled=false;assert.equal((await GET(new Request(url))).status,409);
});
test('submission route works without authentication and fails clearly when CMS is missing',async()=>{
  const client=fakeClient();const {POST}=load('app/api/entries/submit/route.ts',{'@/lib/sanity/client':{getSanityWriteClient:()=>client}});
  const res=await POST(new Request('https://example.test/api/entries/submit',{method:'POST',body:form()}));assert.equal(res.status,200);assert.equal(client.docs.size,1);
  const missing=load('app/api/entries/submit/route.ts',{'@/lib/sanity/client':{getSanityWriteClient:()=>null}});
  assert.equal((await missing.POST(new Request('https://example.test',{method:'POST',body:form()}))).status,503);
});
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

