import JSZip from 'jszip';
import type {SanityClient} from 'next-sanity';

export type BackupDocument = {_id: string; _type: string; [key: string]: any};
export type BackupAsset = {id: string; type: 'image' | 'file'; path: string; filename: string; mimeType: string; size: number; sha256?: string; url?: string};
export interface CMSBackup {
  format: 'rimna-cms'; version: number; exportedAt: string; projectId?: string; dataset?: string;
  documents: BackupDocument[]; assets: BackupAsset[];
}
export interface PreparedBackup {backup: CMSBackup; files: Map<string, Uint8Array>}
const assetTypes = ['sanity.imageAsset', 'sanity.fileAsset'];
const system = (doc: BackupDocument) => doc._type.startsWith('sanity.') || doc._id.startsWith('_.');
const chunks = <T,>(items: T[], size = 100) => Array.from({length: Math.ceil(items.length / size)}, (_, i) => items.slice(i * size, (i + 1) * size));
const digest = async (bytes: Uint8Array) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes)))).map(b => b.toString(16).padStart(2, '0')).join('');

export async function collectBackup(client: SanityClient): Promise<CMSBackup> {
  const all: BackupDocument[] = [];
  let after = '';
  const before = new Date().toISOString();
  for (;;) {
    const page = await client.fetch<BackupDocument[]>(`*[!(_id in path("_.**")) && (!(_type match "sanity.*") || _type in ["sanity.imageAsset", "sanity.fileAsset"]) && _id > $after && _createdAt <= $before] | order(_id asc)[0...500]`, {after, before}, {perspective: 'raw', cache: 'no-store'});
    all.push(...page);
    if (page.length < 500) break;
    after = page[page.length - 1]._id;
  }
  const config = client.config();
  return {format: 'rimna-cms', version: 3, exportedAt: before, projectId: config.projectId, dataset: config.dataset,
    documents: all.filter(doc => !system(doc)),
    assets: all.filter(doc => assetTypes.includes(doc._type)).map(doc => ({id: doc._id, type: doc._type === 'sanity.imageAsset' ? 'image' : 'file', path: `assets/${doc._id}`, filename: doc.originalFilename || doc._id, mimeType: doc.mimeType || 'application/octet-stream', size: doc.size, url: doc.url})),
  };
}

export async function backupZIP(backup: CMSBackup, progress: (message: string) => void = () => {}, fetchAsset: typeof fetch = fetch) {
  const zip = new JSZip();
  const assets: BackupAsset[] = [];
  for (const asset of backup.assets) {
    progress(`Downloading media ${assets.length + 1} of ${backup.assets.length}…`);
    const url = new URL(asset.url || '');
    if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') throw new Error(`Invalid media URL: ${asset.id}`);
    if (backup.projectId && backup.dataset && !url.pathname.startsWith(`/${asset.type === 'image' ? 'images' : 'files'}/${backup.projectId}/${backup.dataset}/`)) throw new Error('Media URL does not belong to this dataset.');
    // dlRaw preserves uploaded bytes; ordinary image URLs may return optimized images.
    url.search = '';
    url.searchParams.set('dlRaw', asset.filename);
    const response = await fetchAsset(url.toString(), {signal: AbortSignal.timeout(60000), redirect:'error'});
    if (!response.ok) throw new Error(`Could not download ${asset.filename}. No complete backup was created; please retry.`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || (asset.size && bytes.length !== asset.size)) throw new Error(`Incomplete media download: ${asset.filename}`);
    zip.file(asset.path, bytes);
    assets.push({...asset, size: bytes.length, sha256: await digest(bytes)});
  }
  zip.file('cms_data_snapshot.json', JSON.stringify({...backup, assets}, null, 2));
  zip.file('README_BACKUP.txt', 'Rimna CMS backup\nIncludes content, translations, published documents, drafts, receipts, images and files.\nRestore this ZIP in CMS Backup & Restore. Matching document IDs are replaced; unrelated documents are kept.\nSanity project configuration, users, permissions and history are not dataset content and are not included.\nExport runs over a short interval; pause content edits and ticket sales for a coordinated point-in-time backup.\n');
  progress('Packing backup…');
  return zip.generateAsync({type: 'uint8array', compression: 'DEFLATE'});
}

export function validateBackup(input: any): CMSBackup {
  const docs = Array.isArray(input) ? input : input?.documents;
  if (!Array.isArray(docs)) throw new Error('Invalid backup: documents must be an array.');
  if (input?.format && (input.format !== 'rimna-cms' || input.version !== 3)) throw new Error('Unsupported backup format or version.');
  const ids = new Set<string>();
  const documents = docs.map(doc => {
    if (!doc || typeof doc !== 'object' || typeof doc._id !== 'string' || !/^[a-zA-Z0-9_.-]{1,128}$/.test(doc._id) || doc._id.startsWith('-') || typeof doc._type !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(doc._type) || system(doc)) throw new Error('Invalid document ID or type in backup.');
    if (doc._id.startsWith('versions.')) throw new Error('Release versions require a native Sanity dataset restore.');
    if (ids.has(doc._id)) throw new Error(`Duplicate document: ${doc._id}`);
    ids.add(doc._id);
    const {_rev, _createdAt, _updatedAt, _originalId, resolvedImageUrl, ...clean} = doc;
    return clean as BackupDocument;
  });
  const assets: BackupAsset[] = input?.assets || [];
  if (!Array.isArray(assets)) throw new Error('Invalid media manifest.');
  const assetIds = new Set<string>();
  for (const asset of assets) {
    if (!asset || typeof asset.id !== 'string' || !/^(image|file)-[a-zA-Z0-9-]+$/.test(asset.id) || asset.path !== `assets/${asset.id}` || !['image','file'].includes(asset.type) || !asset.id.startsWith(`${asset.type}-`) || !Number.isSafeInteger(asset.size) || asset.size < 0 || typeof asset.filename !== 'string' || typeof asset.mimeType !== 'string' || assetIds.has(asset.id)) throw new Error('Invalid or duplicate media entry.');
    assetIds.add(asset.id);
  }
  return {format:'rimna-cms', version:3, exportedAt:input.exportedAt || '', projectId:input.projectId, dataset:input.dataset, documents, assets};
}

export async function readBackup(bytes: ArrayBuffer, zipFile: boolean): Promise<PreparedBackup> {
  let zip: JSZip | undefined;
  let input: any;
  if (zipFile) {
    zip = await JSZip.loadAsync(bytes, {checkCRC32: true});
    const snapshot = zip.file('cms_data_snapshot.json');
    if (!snapshot) throw new Error('ZIP is missing cms_data_snapshot.json.');
    input = JSON.parse(await snapshot.async('string'));
  } else input = JSON.parse(new TextDecoder().decode(bytes));
  const backup = validateBackup(input);
  const files = new Map<string, Uint8Array>();
  if (zip) for (const asset of backup.assets) {
    const file = zip.file(asset.path);
    if (!file) throw new Error(`Backup is missing media: ${asset.filename}`);
    const data = await file.async('uint8array');
    if (data.length !== asset.size || !asset.sha256 || await digest(data) !== asset.sha256) throw new Error(`Media integrity check failed: ${asset.filename}`);
    files.set(asset.id, data);
  }
  return {backup, files};
}

function references(value: any, result = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach(v => references(v, result));
  else if (value && typeof value === 'object') {
    if (typeof value._ref === 'string' && !value._weak && !value._dataset) result.add(value._ref);
    Object.values(value).forEach(v => references(v, result));
  }
  return result;
}
function remap(value: any, ids: Map<string,string>): any {
  if (Array.isArray(value)) return value.map(v => remap(v, ids));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key,v]) => [key, key === '_ref' && !value._dataset && ids.has(String(v)) ? ids.get(String(v)) : remap(v, ids)]));
}

export async function restoreBackup(client: SanityClient, prepared: PreparedBackup, progress: (message: string) => void = () => {}) {
  // Validate every document and reference before performing any write.
  const backup = validateBackup(prepared.backup);
  const docIds = new Set(backup.documents.map(d => d._id));
  const external = Array.from(references(backup.documents)).filter(id => !docIds.has(id));
  const expected = Array.from(new Set([...external, ...backup.assets.map(a => a.id)]));
  const existing = new Set<string>();
  for (const page of chunks(expected)) for (const doc of await client.getDocuments(page)) if (doc) existing.add(doc._id);
  for (const id of external) if (!existing.has(id) && !prepared.files.has(id)) throw new Error(`Missing referenced document or media: ${id}. Restore a complete ZIP backup or restore that document first.`);
  for (const asset of backup.assets) {
    const bytes = prepared.files.get(asset.id);
    if (!bytes && !existing.has(asset.id)) throw new Error(`Media ${asset.filename} is missing from this dataset. Use the full ZIP backup.`);
    if (bytes && (bytes.length !== asset.size || !asset.sha256 || await digest(bytes) !== asset.sha256)) throw new Error(`Media integrity check failed: ${asset.filename}`);
  }
  // Each batch is bounded by both mutation count and serialized bytes.
  const batches: BackupDocument[][] = []; let batch: BackupDocument[] = []; let size = 0;
  for (const doc of backup.documents) {
    const length = new TextEncoder().encode(JSON.stringify(doc)).length;
    if (length > 3000000) throw new Error(`Document too large to restore: ${doc._id}`);
    if (batch.length && (batch.length >= 100 || size + length > 3000000)) {batches.push(batch); batch = []; size = 0;}
    batch.push(doc); size += length;
  }
  if (batch.length) batches.push(batch);
  const assetMap = new Map<string,string>();
  let completed = 0;
  try {
    for (const asset of backup.assets) {
      if (existing.has(asset.id)) {assetMap.set(asset.id, asset.id); continue;}
      progress(`Restoring media: ${asset.filename}`);
      const saved = await client.assets.upload(asset.type, new Blob([new Uint8Array(prepared.files.get(asset.id)!)], {type: asset.mimeType}), {filename: asset.filename, contentType: asset.mimeType});
      assetMap.set(asset.id, saved._id);
    }
    // Create missing IDs first so forward and circular references work across batches.
    // Existing documents remain intact until their replacement batch commits.
    for (const page of chunks(backup.documents)) {
      let transaction = client.transaction();
      for (const doc of page) transaction = transaction.createIfNotExists({_id:doc._id, _type:doc._type});
      await transaction.commit({visibility:'sync'});
    }
    for (const page of batches) {
      let transaction = client.transaction();
      for (const doc of page) transaction = transaction.createOrReplace(remap(doc, assetMap));
      await transaction.commit({visibility:'sync'});
      completed += page.length;
      progress(`Restored ${completed} of ${backup.documents.length} documents.`);
    }
  } catch (error) {
    throw new Error(`Restore stopped: ${completed} of ${backup.documents.length} documents restored. Some media or placeholder documents may have been created. Keep the backup and retry to finish. ${error instanceof Error ? error.message : ''}`);
  }
  return completed;
}
