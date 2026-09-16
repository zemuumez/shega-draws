import JSZip from 'jszip';
export interface PlayerReceipt {
  _id: string; _rev?: string; playerName?: string; playerPhone?: string; drawId?: string;
  luckyNumber?: string; poolCapacity?: string; amount?: number; currency?: string;
  paymentMethod?: string; paymentReference?: string; submittedAt?: string; status?: string;
  adminNotes?: string; imageUrl?: string; mimeType?: string;
}
export function screenshotFilename(entry: PlayerReceipt) {
  const extension = entry.mimeType === 'image/png' ? 'png' : entry.mimeType === 'image/webp' ? 'webp' : 'jpg';
  return `screenshots/${entry._id.replace(/[^a-zA-Z0-9._-]/g, '_')}.${extension}`;
}
function xml(value: unknown): string {
  return String(value ?? '').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[c]!));
}
function column(index: number) {
  let result = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) result = String.fromCharCode(65 + (n - 1) % 26) + result;
  return result;
}
// Inline string cells preserve leading zeroes, +phone prefixes and untrusted text as text.
export async function playersWorkbook(entries: PlayerReceipt[], downloads?: Map<string, string>) {
  const headers = ['Submission ID', 'Player name', 'Phone', 'Draw', 'Ticket number', 'Pool capacity', 'Amount', 'Currency', 'Payment method', 'Payment reference', 'Submitted at (UTC)', 'Review status', 'Staff notes', 'Screenshot file', 'Screenshot download'];
  const rows: unknown[][] = [headers, ...entries.map(e => [e._id, e.playerName, e.playerPhone, e.drawId, e.luckyNumber, e.poolCapacity, e.amount, e.currency, e.paymentMethod, e.paymentReference, e.submittedAt, e.status || 'pending', e.adminNotes, e.imageUrl ? screenshotFilename(e) : '', downloads?.get(e._id) || (e.imageUrl ? 'Not included (Excel only)' : 'No screenshot')])];
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
  zip.file('_rels/.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.file('xl/workbook.xml', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Players" sheetId="1" r:id="rId1"/></sheets></workbook>');
  zip.file('xl/_rels/workbook.xml.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
  const data = rows.map((row, i) => `<row r="${i + 1}">${row.map((cell, j) => typeof cell === 'number' && Number.isFinite(cell) ? `<c r="${column(j)}${i + 1}"><v>${cell}</v></c>` : `<c r="${column(j)}${i + 1}" t="inlineStr"><is><t xml:space="preserve">${xml(cell)}</t></is></c>`).join('')}</row>`).join('');
  zip.file('xl/worksheets/sheet1.xml', `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="15" width="24" customWidth="1"/></cols><sheetData>${data}</sheetData><autoFilter ref="A1:O${rows.length}"/></worksheet>`);
  return zip.generateAsync({type: 'uint8array', compression: 'DEFLATE'});
}
export async function reviewArchive(entries: PlayerReceipt[], progress?: (done: number, total: number) => void) {
  const zip = new JSZip();
  const downloads = new Map<string, string>();
  const failures: string[] = [];
  let completed = 0;
  // Sequential downloads keep request pressure bounded; select a draw for large exports.
  for (const entry of entries) {
    if (!entry.imageUrl) { downloads.set(entry._id, 'No screenshot'); failures.push(`${entry._id}: no screenshot`); }
    else {
      try {
        const response = await fetch(entry.imageUrl, {signal: AbortSignal.timeout(30000)});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        zip.file(screenshotFilename(entry), await response.arrayBuffer());
        downloads.set(entry._id, 'Included');
      } catch (error) {
        downloads.set(entry._id, 'Failed — retry download');
        failures.push(`${entry._id}: ${error instanceof Error ? error.message : 'Download failed'}`);
      }
    }
    progress?.(++completed, entries.length);
  }
  zip.file('players.xlsx', await playersWorkbook(entries, downloads));
  zip.file('README.txt', 'Match each player to the Screenshot file column in players.xlsx. Payments require manual review in Sanity.\n' + (failures.length ? '\nMissing screenshots:\n' + failures.join('\n') : '\nAll screenshots downloaded successfully.'));
  return {data: await zip.generateAsync({type: 'uint8array', compression: 'DEFLATE'}), failures};
}
