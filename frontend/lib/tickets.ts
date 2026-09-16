import type { CMSSiteSettings } from './sanity/queries';
export interface TicketDraw {
  _id: string; _rev?: string; drawId: string; title?: string;
  currency: 'ETB' | 'USD'; ticketPrice: number; poolCapacity: number;
  status: string; deadline?: string;
}
export const MAX_POOL_SIZE = 100000;
export const MAX_PROOF_BYTES = 3 * 1024 * 1024;
export interface TicketSelection {
  key: string; label: string; currency: 'ETB' | 'USD'; ticketPrice: number; poolCapacity: number;
}
export function selectionKey(currency: string, price: number, pool: number) {
  return `RDL-${currency}-${price}-${pool}`;
}
export function isAllowedSelection(currency: string, price: number, pool: number, settings: CMSSiteSettings | null): boolean {
  if (!settings || !['ETB', 'USD'].includes(currency)) return false;
  const prices = currency === 'USD' ? settings.usdPrices : settings.etbPrices;
  return Number.isSafeInteger(pool) && pool > 0 && pool <= MAX_POOL_SIZE &&
    Number.isFinite(price) && price > 0 &&
    !!prices?.some(p => p.value === price && p.isEnabled !== false) &&
    !!settings.poolSizes?.some(p => p.size === pool && p.isEnabled !== false);
}
export function validNumber(value: string, capacity: number) {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= 1 && Number(value) <= capacity;
}
export function paymentMethods(settings: CMSSiteSettings | null | undefined, currency: string) {
  if (currency === 'USD') return settings?.diasporaWireInstructions?.trim() ? [{id: 'wire', label: 'International transfer'}] : [];
  return [
    ...(settings?.telebirrMerchantCode?.trim() ? [{id: 'telebirr', label: 'Telebirr'}] : []),
    ...(settings?.cbeAccountNumber?.trim() ? [{id: 'cbe', label: 'CBE Birr / Bank'}] : []),
  ];
}
