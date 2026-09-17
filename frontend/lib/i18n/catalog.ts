import {translations} from './translations';
import {uiCopy,copyKey} from './uiCopy';
export interface TranslationEntry {key:string; en:string; am:string; ti:string; category:string; _id:string}
export const translationCategory = (key:string) => {
  const root=key.split('.')[0];
  if(root==='nav')return 'nav';
  if(['hero','promo'].includes(root))return 'hero';
  if(['ticket','configurator','quickPick','prizes','ticketModal','ui'].includes(root))return 'ticket';
  if(['draws','drawsExplorer','adsSection','resultsPage'].includes(root))return 'draws';
  if(root==='fairness')return 'fairness';
  if(root==='winners')return 'winners';
  if(['faq','howItWorks'].includes(root))return 'faq';
  if(['testimonials','testimonialsSection'].includes(root))return 'testimonials';
  if(root==='footer')return 'footer';
  if(root==='payments')return 'payments';
  return 'general';
};
const entries: TranslationEntry[]=[];
function walk(en:any,am:any,ti:any,prefix='') {
  for(const key of Object.keys(en)) {
    const path=prefix?`${prefix}.${key}`:key;
    if(typeof en[key]==='string') entries.push({key:path,en:en[key],am:am?.[key] || '',ti:ti?.[key] || '',category:translationCategory(path),_id:`ui-${path.replace(/[^a-zA-Z0-9_-]/g,'-')}`});
    else if(en[key]&&typeof en[key]==='object')walk(en[key],am?.[key],ti?.[key],path);
  }
}
walk(translations.en,translations.am,translations.ti);
for(const [en,am,ti] of uiCopy){const key=copyKey(en);if(!entries.some(e=>e.key===key))entries.push({key,en,am,ti,category:translationCategory(key),_id:`ui-${key.replace(/[^a-zA-Z0-9_-]/g,'-')}`});}
export const translationCatalog = entries;
