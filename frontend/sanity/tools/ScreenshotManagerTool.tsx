"use client";
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useClient} from 'sanity';
import {playersWorkbook, reviewArchive, type PlayerReceipt} from '@/lib/exports/players';

const inputStyle: React.CSSProperties = {padding: '10px 12px', borderRadius: 6, border: '1px solid #8a8a8a', background: 'transparent', color: 'inherit'};
const buttonStyle: React.CSSProperties = {...inputStyle, cursor: 'pointer', fontWeight: 600};
function download(data: Uint8Array, filename: string, type: string) {
  const blob = new Blob([new Uint8Array(data)], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export function ScreenshotManagerTool() {
  const client = useClient({apiVersion: '2024-01-01'});
  const [entries, setEntries] = useState<PlayerReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({drawId: '', poolCapacity: '', amount: '', currency: '', status: ''});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(100);
  const [preview, setPreview] = useState<PlayerReceipt | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const all: PlayerReceipt[] = [];
      let after = '';
      // Stable ID pagination includes datasets larger than one query page.
      const before = new Date().toISOString();
      for (;;) {
        const page = await client.fetch<PlayerReceipt[]>(`*[_type == "playerEntry" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && _id > $after && _createdAt <= $before] | order(_id asc)[0...1000]{_id, _rev, playerName, playerPhone, drawId, luckyNumber, poolCapacity, amount, currency, paymentMethod, paymentReference, submittedAt, status, adminNotes, "imageUrl": proofScreenshot.asset->url, "mimeType": proofScreenshot.asset->mimeType}`, {after, before}, {perspective: 'raw'});
        all.push(...page);
        if (page.length < 1000) break;
        after = page[page.length - 1]._id;
      }
      setEntries(all.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '')));
      setSelected(new Set());
    } catch { setError('Could not load receipts. Check your Sanity login and dataset permissions, then refresh.'); setEntries([]); }
    finally { setLoading(false); }
  }, [client]);
  useEffect(() => { void refresh(); }, [refresh]);
  const filtered = useMemo(() => entries.filter(e => Object.entries(filters).every(([key, value]) => !value || String(key === 'status' ? e.status || 'pending' : e[key as keyof PlayerReceipt] ?? '') === value)), [entries, filters]);
  useEffect(() => { setSelected(new Set()); setVisibleCount(100); }, [filters]);
  const chosen = filtered.filter(e => selected.has(e._id));
  async function exportItems(items: PlayerReceipt[], withScreenshots: boolean) {
    if (!items.length) return;
    setBusy(true); setMessage('Preparing export…'); setError('');
    try {
      const date = new Date().toISOString().slice(0, 10);
      if (withScreenshots) {
        const result = await reviewArchive(items, (done, total) => setMessage(`Downloading screenshot ${done} of ${total}…`));
        download(result.data, `rimna-review-${date}.zip`, 'application/zip');
        setMessage(`Exported ${items.length} players with ${items.length - result.failures.length} screenshots.`);
        if (result.failures.length) setError(`${result.failures.length} screenshots are missing. The Excel file and README inside the ZIP identify them; refresh and retry these entries.`);
      } else {
        download(await playersWorkbook(items), `rimna-players-${date}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        setMessage(`Exported ${items.length} players to Excel.`);
      }
    } catch { setError('Export failed. Try a smaller selection or refresh and retry.'); setMessage(''); }
    finally { setBusy(false); }
  }
  return <div style={{padding: '28px', height: '100%', overflow: 'auto', boxSizing: 'border-box'}}>
    <h1>Players & payment receipts</h1>
    <p>Download the players list in Excel, or download Excel and matching screenshots together in a ZIP. Confirm or reject payments in Submitted Ticket Receipts after reviewing them.</p>
    <p>All submitted numbers stay reserved, including rejected receipts. Delete a receipt in Studio only when you intend to release its number.</p>
    <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', margin: '20px 0'}}>
      {(Object.keys(filters) as (keyof typeof filters)[]).map(key => <label key={key} style={{display: 'grid', gap: 6}}>
        {{drawId: 'Draw', poolCapacity: 'Pool capacity', amount: 'Price', currency: 'Currency', status: 'Review status'}[key]}
        <select aria-label={key} disabled={busy} style={inputStyle} value={filters[key]} onChange={e => setFilters({...filters, [key]: e.target.value})}>
          <option value="">All</option>
          {Array.from(new Set(entries.map(e => String(key === 'status' ? e.status || 'pending' : e[key] ?? '')).filter(Boolean))).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})).map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>)}
      <button style={buttonStyle} onClick={refresh} disabled={loading || busy}>Refresh</button>
    </div>
    <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
      <button style={buttonStyle} disabled={loading || busy || !filtered.length} onClick={() => exportItems(filtered, false)}>Excel — filtered ({filtered.length})</button>
      <button style={buttonStyle} disabled={loading || busy || !filtered.length} onClick={() => exportItems(filtered, true)}>Excel + screenshots ZIP — filtered</button>
      <button style={buttonStyle} disabled={loading || busy || !chosen.length} onClick={() => exportItems(chosen, false)}>Excel — selected ({chosen.length})</button>
      <button style={buttonStyle} disabled={loading || busy || !chosen.length} onClick={() => exportItems(chosen, true)}>Excel + screenshots ZIP — selected</button>
    </div>
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" style={{color: '#e45c5c'}}>{error}</p>}
    {loading ? <p role="status">Loading receipts…</p> : <>
      <p>{filtered.length} matching receipts · {chosen.length} selected</p>
      <div style={{overflowX: 'auto'}}><table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
        <thead><tr><th><input type="checkbox" aria-label="Select all filtered players" disabled={busy || !filtered.length} checked={filtered.length > 0 && chosen.length === filtered.length} onChange={e => setSelected(e.target.checked ? new Set(filtered.map(x => x._id)) : new Set())}/></th>
          {['Player', 'Phone', 'Draw / pool', 'Number', 'Payment', 'Reference', 'Status', 'Screenshot'].map(h => <th key={h} style={{padding: 12}}>{h}</th>)}
        </tr></thead>
        <tbody>{filtered.slice(0, visibleCount).map(e => <tr key={e._id} style={{borderTop: '1px solid #8885'}}>
          <td><input type="checkbox" disabled={busy} aria-label={`Select ${e.playerName || e._id}`} checked={selected.has(e._id)} onChange={() => setSelected(prev => {const next = new Set(prev); next.has(e._id) ? next.delete(e._id) : next.add(e._id); return next;})}/></td>
          <td style={{padding: 12}}>{e.playerName}</td><td>{e.playerPhone}</td><td>{e.drawId}<br/>{e.poolCapacity} slots</td><td>{e.luckyNumber}</td><td>{e.amount} {e.currency}<br/>{e.paymentMethod}</td><td>{e.paymentReference || '—'}</td><td>{e.status || 'pending'}</td>
          <td>{e.imageUrl ? <button style={buttonStyle} onClick={() => setPreview(e)}>View</button> : 'Missing'}</td>
        </tr>)}</tbody>
      </table></div>
      {!filtered.length && <p>No receipts match these filters.</p>}
      {visibleCount < filtered.length && <button style={buttonStyle} onClick={() => setVisibleCount(n => n + 100)}>Show next 100 (exports include all filtered rows)</button>}
    </>}
    {preview && <div role="dialog" aria-modal="true" aria-label="Payment screenshot" style={{position: 'fixed', inset: 0, background: '#000d', zIndex: 9999, display: 'grid', placeItems: 'center'}} onClick={() => setPreview(null)}>
      <div style={{maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto'}} onClick={e => e.stopPropagation()}>
        <button style={{...buttonStyle, background: '#fff', color: '#111'}} onClick={() => setPreview(null)}>Close screenshot</button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview.imageUrl} alt={`Payment receipt for ${preview.playerName}`} style={{display: 'block', maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain'}}/>
      </div>
    </div>}
  </div>;
}
