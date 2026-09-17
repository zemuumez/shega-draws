"use client";
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useClient} from 'sanity';
import {collectBackup, backupZIP, readBackup, restoreBackup, type PreparedBackup} from '@/lib/backup/cms';

const panel: React.CSSProperties = {background:'#1e293b', border:'1px solid #475569', borderRadius:12, padding:24, marginBottom:20};
const button: React.CSSProperties = {padding:'12px 18px', borderRadius:8, border:'1px solid #94a3b8', background:'#facc15', color:'#111827', fontWeight:700, cursor:'pointer'};
function download(data: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export function BackupView() {
  const studioClient = useClient({apiVersion:'2024-01-01'});
  const client = useMemo(() => studioClient.withConfig({perspective:'raw', useCdn:false}), [studioClient]);
  const [stats, setStats] = useState<Record<string,number> | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState<PreparedBackup | null>(null);
  const [filename, setFilename] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const selection = useRef(0);
  const refresh = useCallback(async () => {
    const result = await client.fetch(`{"Content documents":count(*[!(_type match "sanity.*") && !(_id in path("_.**"))]), "Receipts":count(*[_type=="playerEntry"]), "Translations":count(*[_type=="uiTranslation"]), "Media files":count(*[_type in ["sanity.imageAsset","sanity.fileAsset"]])}`, {}, {perspective:'raw', cache:'no-store'});
    setStats(result);
  }, [client]);
  useEffect(() => {void refresh().catch(() => setError('Could not load dataset counts. Check your Studio login and permissions.'));}, [refresh]);
  async function exportBackup(zip: boolean) {
    setBusy(true); setError(''); setMessage('Collecting content and media records…');
    try {
      const backup = await collectBackup(client);
      const stamp = new Date().toISOString().replace(/[:.]/g,'-');
      if (zip) download(new Uint8Array(await backupZIP(backup,setMessage,(url,options) => fetch(url, {...options, credentials:'include', headers:client.config().token ? {Authorization:`Bearer ${client.config().token}`} : {}}))), `rimna_full_cms_bundle_${stamp}.zip`, 'application/zip');
      else download(JSON.stringify(backup,null,2), `rimna_cms_backup_${stamp}.json`, 'application/json');
      setMessage(`Backup download prepared: ${backup.documents.length} content documents and ${backup.assets.length} ${zip ? 'media files' : 'media references'}.`);
    } catch (e) {setError(e instanceof Error ? e.message : 'Backup failed. Please retry.'); setMessage('');}
    finally {setBusy(false);}
  }
  async function selectFile(file?: File) {
    const attempt = ++selection.current;
    setPrepared(null); setConfirmed(false); setError(''); setFilename(file?.name || '');
    if (!file) return;
    setBusy(true); setMessage('Validating backup…');
    try {
      if (file.size > 500 * 1024 * 1024) throw new Error('This browser restore supports files up to 500 MB. Use Sanity dataset tools for larger archives.');
      const parsed = await readBackup(await file.arrayBuffer(), file.name.toLowerCase().endsWith('.zip'));
      if (attempt === selection.current) {setPrepared(parsed); setMessage('Backup validated. Review the contents before restoring.');}
    } catch (e) {if (attempt === selection.current) {setError(e instanceof Error ? e.message : 'Invalid backup.'); setMessage('');}}
    finally {if (attempt === selection.current) setBusy(false);}
  }
  async function restore() {
    if (!prepared || !confirmed || busy) return;
    setBusy(true); setError(''); setMessage('Checking references and media…');
    try {
      const total = await restoreBackup(client,prepared,setMessage);
      setMessage(`Restore complete: ${total} documents restored. Unrelated content was kept.`);
      setConfirmed(false);
      await refresh().catch(() => setError('Restore succeeded, but counts could not refresh. Reload Studio to see updated counts.'));
    } catch (e) {setError(e instanceof Error ? e.message : 'Restore failed.'); setMessage('');}
    finally {setBusy(false);}
  }
  return <div style={{padding:24, maxWidth:1000, margin:'0 auto', color:'#f8fafc', height:'100%', overflow:'auto', boxSizing:'border-box'}}>
    <h1>CMS Backup & Restore</h1>
    <p>Back up settings, translations, draws, results, ads, testimonials, contact messages and ticket receipts, including published content and drafts.</p>
    <p>For a consistent backup, pause ticket sales and content edits while exporting. Project members, permissions and revision history are managed separately by Sanity.</p>
    {stats && <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>{Object.entries(stats).map(([name,value]) => <div key={name} style={panel}><strong style={{fontSize:24}}>{value}</strong><div>{name}</div></div>)}</div>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" style={{color:'#fca5a5'}}>{error}</p>}
    <h2>Export backup</h2>
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap:20}}>
      <section style={panel}><h3>Complete ZIP backup</h3><p>Includes all content and the actual image and file downloads, including payment screenshots. Use this for a complete restore.</p><button style={button} disabled={busy} onClick={() => exportBackup(true)}>Download full ZIP backup</button></section>
      <section style={panel}><h3>Content JSON backup</h3><p>Includes content and media references. Images and files must still exist in the destination dataset to restore this file.</p><button style={button} disabled={busy} onClick={() => exportBackup(false)}>Download JSON backup</button></section>
    </div>
    <section style={panel}><h2>Restore a saved backup</h2><p>Choose a ZIP or JSON backup. Older Rimna JSON backups are also supported. Matching documents are replaced; unrelated documents are kept.</p>
      <input aria-label="Backup file" type="file" accept=".json,.zip,application/json,application/zip" disabled={busy} onChange={e=>void selectFile(e.target.files?.[0])}/>
      {prepared && <div style={{marginTop:20}}>
        <p><strong>{filename}</strong> · {prepared.backup.documents.length} documents · {prepared.backup.assets.length} media references</p>
        <p>Source: {prepared.backup.projectId || 'legacy backup'} / {prepared.backup.dataset || 'unknown'}<br/>Destination: {client.config().projectId} / {client.config().dataset}</p>
        <p>Download a current ZIP backup before restoring. Large restores run in batches; if interrupted, retry the same backup to finish.</p>
        <label style={{display:'block', marginBottom:16}}><input type="checkbox" disabled={busy} checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I understand this replaces documents with matching IDs in this dataset.</label>
        <button style={button} disabled={busy || !confirmed || !prepared.backup.documents.length} onClick={restore}>{busy ? 'Working…' : 'Restore backup'}</button>
      </div>}
    </section>
  </div>;
}
