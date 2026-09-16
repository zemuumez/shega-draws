import { createHash } from 'node:crypto';
import type { SanityClient } from 'next-sanity';
import { isAllowedSelection, selectionKey, paymentMethods, validNumber, MAX_PROOF_BYTES, MAX_POOL_SIZE, type TicketSelection } from '../tickets';
import type { CMSSiteSettings } from '../sanity/queries';
export class TicketError extends Error { constructor(message: string, public status = 400) { super(message); } }
const published = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';
export async function ticketSelection(client: SanityClient, currency: string, price: number, pool: number) {
  if (!['ETB', 'USD'].includes(currency) || !Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(pool) || pool < 1 || pool > MAX_POOL_SIZE) {
    throw new TicketError('Please choose a valid ticket price and pool.');
  }
  const settings = await client.fetch<(CMSSiteSettings & {_id: string; _rev: string}) | null>(`*[_type == "siteSettings" && ${published}] | order(_updatedAt desc)[0]`, {}, {cache: 'no-store'});
  if (!settings) throw new TicketError('Ticket options are not configured yet. Please try again later.', 503);
  if (!isAllowedSelection(currency, price, pool, settings)) throw new TicketError('This price or pool has been disabled. Please choose another ticket option.', 409);
  const key = selectionKey(currency, price, pool);
  const selection: TicketSelection = {key, label: key, currency: currency as 'ETB' | 'USD', ticketPrice: price, poolCapacity: pool};
  return {selection, settings};
}
export function entryId(key: string, number: string) {
  return `private.entry.${createHash('sha256').update(`${key}:${Number(number)}`).digest('hex')}`;
}
export async function takenNumbers(client: SanityClient, selection: TicketSelection): Promise<string[]> {
  // A pool is identified by currency + price + capacity, independently of draw documents.
  // Include older receipts even if they were linked to a draw or stored formatted capacities.
  const entries = await client.fetch<{luckyNumber: string; poolCapacity?: string | number}[]>(`*[_type == "playerEntry" && ${published} && currency == $currency && amount == $price]{luckyNumber, poolCapacity}`, {
    currency: selection.currency, price: selection.ticketPrice,
  }, {cache: 'no-store'});
  return Array.from(new Set(entries
    .filter(e => Number.parseInt(String(e.poolCapacity).replace(/[,\s]/g, ''), 10) === selection.poolCapacity)
    .map(e => String(Number(e.luckyNumber)))
    .filter(n => validNumber(n, selection.poolCapacity))));
}
function field(form: FormData, name: string, min: number, max: number) {
  const value = form.get(name);
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw new TicketError(`Please provide a valid ${name.replaceAll('_', ' ')}.`);
  return value.trim();
}
export async function createTicket(client: SanityClient, form: FormData) {
  const currency = field(form, 'currency', 3, 3);
  const price = Number(field(form, 'amount', 1, 24));
  const pool = Number(field(form, 'pool_capacity', 1, 6));
  const key = selectionKey(currency, price, pool);
  const submissionId = field(form, 'submission_id', 36, 36);
  if (!/^[0-9a-f-]{36}$/i.test(submissionId)) throw new TicketError('Invalid submission reference. Reopen the ticket form.');
  const name = field(form, 'user_name', 2, 120);
  const phone = field(form, 'user_phone', 7, 30);
  if (!/^\+?[\d ()-]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 7) throw new TicketError('Enter a valid phone number.');
  const number = field(form, 'number', 1, 6);
  const method = field(form, 'method', 1, 30);
  const reference = field(form, 'payment_reference', 6, 120);
  const proof = form.get('proof');
  if (!proof || typeof proof === 'string' || proof.size === 0 || proof.size > MAX_PROOF_BYTES) throw new TicketError('Upload a payment screenshot up to 3 MB.');
  const bytes = Buffer.from(await proof.arrayBuffer());
  const mime = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png' :
    bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'image/jpeg' :
    bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : '';
  if (!mime || proof.type !== mime) throw new TicketError('Upload a valid PNG, JPEG or WebP screenshot.');
  const id = entryId(key, number);
  const fingerprint = createHash('sha256').update(JSON.stringify({key, number: Number(number), name, phone, method, reference})).update(bytes).digest('hex');
  const existing = await client.getDocument<{_id: string; submissionId?: string; submissionFingerprint?: string; status: string}>(id);
  if (existing) {
    if (existing.submissionId === submissionId && existing.submissionFingerprint === fingerprint) return {id, status: existing.status};
    throw new TicketError('This number has already been taken. Please choose another number.', 409);
  }
  let {selection, settings} = await ticketSelection(client, currency, price, pool);
  if (!validNumber(number, selection.poolCapacity)) throw new TicketError(`Choose a number from 1 to ${selection.poolCapacity}.`);
  if (!paymentMethods(settings, currency).some(m => m.id === method)) throw new TicketError('This payment method is not configured.');
  if ((await takenNumbers(client, selection)).includes(String(Number(number)))) throw new TicketError('This number has already been taken. Please choose another number.', 409);
  const asset = await client.assets.upload('image', bytes, {filename: 'payment-proof', contentType: mime});
  // Unique pool/number IDs prevent double bookings. The revision guard prevents
  // a purchase when an administrator disables an option during the screenshot upload.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await client.transaction()
        .patch(settings._id, p => p.ifRevisionId(settings._rev).set({lastEntryAt: new Date().toISOString()}))
        .create({_id: id, _type: 'playerEntry', submissionId, submissionFingerprint: fingerprint,
          playerName: name, playerPhone: phone, selectionKey: key, drawId: selection.label,
          luckyNumber: String(Number(number)), poolCapacity: String(selection.poolCapacity),
          amount: selection.ticketPrice, currency: selection.currency, paymentMethod: method, paymentReference: reference,
          submittedAt: new Date().toISOString(), status: 'pending',
          proofScreenshot: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}},
        }).commit({visibility: 'sync'});
      return {id, status: 'pending'};
    } catch (error) {
      // A timeout may occur after a successful commit. Make retry safe without
      // deleting an asset another in-flight submission might also reference.
      const saved = await client.getDocument<{_id: string; submissionId?: string; submissionFingerprint?: string; status: string}>(id).catch(() => undefined);
      if (saved?.submissionId === submissionId && saved.submissionFingerprint === fingerprint) return {id, status: saved.status};
      if (saved) throw new TicketError('This number has already been taken. Please choose another number.', 409);
      if ((error as {statusCode?: number}).statusCode !== 409) throw error;
      // Another legitimate purchase may have updated settings. Recheck the switches
      // and retry atomically with the already-uploaded screenshot.
      ({selection, settings} = await ticketSelection(client, currency, price, pool));
      if (!paymentMethods(settings, currency).some(m => m.id === method)) throw new TicketError('This payment method is no longer configured.');
      if ((await takenNumbers(client, selection)).includes(String(Number(number)))) throw new TicketError('This number has already been taken. Please choose another number.', 409);
    }
  }
  throw new TicketError('Availability changed while submitting. Please try again.', 409);
}
