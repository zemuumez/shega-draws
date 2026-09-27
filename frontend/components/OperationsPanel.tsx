"use client";
import {useEffect,useState} from "react";
import {accountAPI} from "@/lib/account-api";
type State={salesPaused:boolean;recoveryLocked:boolean;reason:string;pendingPayments:number;refundRequired:number;workerLastSeen:string|null;backups:{id:string;status:string;requestedAt:string;snapshotId:string;message:string}[]};
export function OperationsPanel(){
 const [data,setData]=useState<State|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[reason,setReason]=useState("");
 async function refresh(){try{setData(await accountAPI<State>("/admin/operations"));setError("")}catch(e){setError((e as Error).message)}}
 useEffect(()=>{void refresh()},[]);
 async function change(action:string,body:object){setBusy(true);try{await accountAPI(`/admin/operations/${action}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});await refresh()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <details className="account-ticket"><summary>Operations, sales pause & backups</summary>
 {error&&<p role="alert">{error}</p>}
 <button disabled={busy} onClick={()=>void refresh()}>Refresh operations</button>
 {data&&<>
 <p><strong>New sales: {data.salesPaused||data.recoveryLocked?"Paused":"Enabled"}</strong>. Individual draw settings also apply.</p>
 <p>{data.reason}</p>
 {data.recoveryLocked&&<p role="alert">Recovery lock is active. An operator must reconcile restored payments before unlocking this system.</p>}
 <p>{data.pendingPayments} payments pending · {data.refundRequired} require refund review.</p>
 <p>Last payment worker heartbeat: {data.workerLastSeen?new Date(data.workerLastSeen).toLocaleString():"Not yet received"}</p>
 <label>Reason for pausing or resuming sales<input value={reason} maxLength={500} onChange={e=>setReason(e.target.value)}/></label>
 <button disabled={busy||reason.trim().length<5||data.recoveryLocked} onClick={()=>void change("sales",{paused:!data.salesPaused,reason})}>{data.salesPaused?"Resume new sales":"Pause new sales"}</button>
 <p>Pausing blocks new reservations across all servers. Existing reservations and payment verification continue. Administrators only.</p>
 <button disabled={busy||data.backups.some(b=>b.status==="queued"||b.status==="running")} onClick={()=>void change("backup",{})}>Request encrypted backup</button>
 <p>The backup operator must be configured and running. Queued does not mean backed up. Successful backups show a snapshot reference; restoration is performed into an isolated database by an operator. Sanity content is backed up separately.</p>
 {data.backups.map(b=><p key={b.id}>{new Date(b.requestedAt).toLocaleString()} · {b.status}{b.snapshotId&&` · Snapshot ${b.snapshotId.slice(0,12)}`}{b.message&&` · ${b.message}`}</p>)}
 </>}
 </details>
}
