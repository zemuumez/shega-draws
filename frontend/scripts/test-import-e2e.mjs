// Local-only import fixture: real ZIP media, repeatability and rollback on collisions.
import assert from 'node:assert/strict';
import {Pool} from 'pg';
import JSZip from 'jszip';
import {createHash,randomUUID} from 'node:crypto';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const db=new Pool({connectionString:'postgres://rimna:local-development-only@localhost:55437/rimna?sslmode=disable'});
const prefix='fixture-'+randomUUID(),schema='import_'+randomUUID().replaceAll('-','');const dir=await mkdtemp(join(tmpdir(),'rimna-import-'));
try{
 await db.query(`CREATE SCHEMA ${schema}`);
 const c=await db.connect();try{await c.query(`SET search_path TO ${schema}`);for(const f of ['001_core.sql','002_payment_safety.sql'])await c.query(await readFile(resolve('../backend/migrations/'+f),'utf8'));}finally{c.release()}
 const image=Buffer.from('fixture-original-receipt'),hash=createHash('sha256').update(image).digest('hex'),asset={id:'image-fixture-1x1-png',type:'image',path:'assets/image-fixture-1x1-png',filename:'receipt.png',mimeType:'image/png',size:image.length,sha256:hash};
 const documents=[{_id:prefix+'-draw',_type:'draw',drawId:'FIXTURE',title:'Fixture',currency:'ETB',ticketPrice:100,poolCapacity:25000},{_id:prefix+'-receipt',_type:'playerEntry',drawId:'FIXTURE',currency:'ETB',amount:100,poolCapacity:'25,000 (25K)',luckyNumber:'0010',playerName:'Legacy example',playerPhone:'0911000000',status:'confirmed',proofScreenshot:{asset:{_ref:asset.id}}},{_id:prefix+'-message',_type:'contactMessage',message:'Fixture'}, {_id:prefix+'-settings',_type:'siteSettings',etbPrices:[{value:100,isEnabled:true}],poolSizes:[{size:25000,isEnabled:true}]}];
 async function backup(docs){const zip=new JSZip();zip.file('cms_data_snapshot.json',JSON.stringify({format:'rimna-cms',version:3,documents:docs,assets:[asset]}));zip.file(asset.path,image);const file=join(dir,'backup.zip');await writeFile(file,await zip.generateAsync({type:'nodebuffer'}));return file}
 const url=new URL('postgres://rimna:local-development-only@localhost:55437/rimna?sslmode=disable');url.searchParams.set('options',`-c search_path=${schema}`);
 function run(file,apply=true){return execFileSync(process.execPath,['--import','tsx','scripts/import-operations.ts',file,...(apply?['--apply']:[])],{env:{...process.env,DATABASE_URL:url.toString(),MEDIA_DIR:join(dir,'media')},encoding:'utf8',stdio:['ignore','pipe','pipe']})}
 const file=await backup(documents);run(file,false);run(file);run(file);
 const orders=(await db.query(`SELECT * FROM ${schema}.orders`)).rows;assert.equal(orders.length,1);assert.equal(orders[0].status,'paid');assert.equal(orders[0].user_id,'unclaimed:'+prefix+'-receipt');assert.equal(orders[0].number,10);
 assert.deepEqual(await readFile(join(dir,'media',hash)),image);
 assert.ok((await db.query(`SELECT status FROM ${schema}.draws`)).rows.every(r=>r.status==='closed'));
 const collision=await backup([...documents,{...documents[1],_id:prefix+'-collision'}]);assert.throws(()=>run(collision));assert.equal((await db.query(`SELECT count(*) FROM ${schema}.orders`)).rows[0].count,'1');assert.equal((await db.query(`SELECT count(*) FROM ${schema}.legacy_records WHERE id=$1`,[prefix+'-collision'])).rows[0].count,'0');
 console.log('PASS: ZIP originals preserved, formatted pool parsed, unclaimed ownership, closed draws, repeatable import, collision rollback.');
}finally{await db.query(`DROP SCHEMA ${schema} CASCADE`);await db.end();await rm(dir,{recursive:true,force:true})}
