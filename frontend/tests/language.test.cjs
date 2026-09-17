const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function load(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  const m = new Module(filename, module);
  m.filename = filename; m.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = m.require.bind(m);
  m.require = id => id.startsWith('.') ? load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${id}.ts`))) : original(id);
  m._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true}}).outputText, filename);
  return m.exports;
}
const { LanguageProvider, useLanguage } = load('lib/i18n/LanguageContext.tsx');
const { translations } = load('lib/i18n/translations.ts');
function Probe() {
  const {language, t, tc} = useLanguage();
  return React.createElement('span', {'data-language':language}, `${t.nav.draws}|${tc('nav.draws')}`);
}
function render(defaultLanguage, cmsTranslations=[]) {
  return renderToStaticMarkup(React.createElement(LanguageProvider, {defaultLanguage, cmsTranslations}, React.createElement(Probe)));
}
for (const lang of ['en','am','ti']) {
  test(`CMS default ${lang} renders in the initial page HTML`,()=>{
    const html=render(lang);
    assert.ok(html.includes(`data-language="${lang}"`));
    assert.ok(html.includes(`${translations[lang].nav.draws}|${translations[lang].nav.draws}`));
  });
}
test('invalid CMS language falls back to English',()=>assert.ok(render('unknown').includes('data-language="en"')));
test('missing localized CMS text preserves built-in translations',()=>{
  const html=render('ti',[{key:'nav.draws',en:'English CMS',ti:'   '}]);
  assert.ok(html.includes(translations.ti.nav.draws));
  assert.ok(!html.includes('English CMS'));
});
test('CMS translations are isolated per render and can be changed or removed',()=>{
  const one=render('ti',[{key:'nav.draws',en:'Draws',ti:'First translation'}]);
  const two=render('ti',[{key:'nav.draws',en:'Draws',ti:'Updated translation'}]);
  const removed=render('ti');
  assert.ok(one.includes('First translation|First translation'));
  assert.ok(two.includes('Updated translation|Updated translation'));
  assert.ok(!two.includes('First translation'));
  assert.ok(removed.includes(translations.ti.nav.draws));
  assert.ok(!removed.includes('Updated translation'));
});
const {translationCatalog}=load('lib/i18n/catalog.ts');
test('every editable website translation has English, Amharic and Tigrinya defaults',()=>{
  assert.ok(translationCatalog.length>390);
  const ids=new Set();
  for(const row of translationCatalog){assert.ok(row.en.trim(),row.key);assert.ok(row.am.trim(),row.key);assert.ok(row.ti.trim(),row.key);assert.ok(!ids.has(row._id),row._id);ids.add(row._id);}
});
function CheckoutProbe(){const {text}=useLanguage();return React.createElement('span',null,text('Payment Screenshot / SMS Proof'));}
test('checkout copy uses CMS overrides and localized fallbacks',()=>{
  const render=(lang,cms=[])=>renderToStaticMarkup(React.createElement(LanguageProvider,{defaultLanguage:lang,cmsTranslations:cms},React.createElement(CheckoutProbe)));
  assert.ok(!render('am').includes('Payment Screenshot'));
  assert.ok(!render('ti').includes('Payment Screenshot'));
  assert.ok(render('ti',[{key:'ui.payment_screenshot_sms_proof',en:'English',ti:'Custom proof label'}]).includes('Custom proof label'));
});
