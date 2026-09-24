// Local only: exercises real Better Auth, SMTP verification, JWT and API revocation.
import assert from 'node:assert/strict';
import {randomUUID,createHmac} from 'node:crypto';
import {Pool} from 'pg';
const web='http://localhost:3100',api='http://localhost:18080',mail='http://localhost:8027';
const email=`integration-${randomUUID()}@example.test`, password=`Test-only-${randomUUID()}`;
const jar=new Map();
async function auth(path,body,method=body?'POST':'GET'){
 const r=await fetch(web+'/api/auth/'+path,{method,redirect:'manual',headers:{Origin:web,'Content-Type':'application/json',Cookie:[...jar].map(([k,v])=>`${k}=${v}`).join('; ')},...(body?{body:JSON.stringify(body)}:{})});
 for(const c of r.headers.getSetCookie()){const pair=c.split(';')[0],i=pair.indexOf('=');jar.set(pair.slice(0,i),pair.slice(i+1))}
 const raw=await r.text();let data;try{data=JSON.parse(raw)}catch{data=raw};return {status:r.status,data};
}
let r=await auth('sign-up/email',{email,password,name:'Integration Test',callbackURL:'/account'});assert.equal(r.status,200,JSON.stringify(r.data));
r=await auth('sign-in/email',{email,password});assert.equal(r.status,403,'unverified account must not sign in');
const messages=(await (await fetch(mail+'/api/v1/messages')).json()).messages;
const message=messages.find(m=>m.To.some(t=>t.Address===email));assert.ok(message,'verification email received locally');
const full=await(await fetch(mail+'/api/v1/message/'+message.ID)).json();
const link=full.Text.match(/http:\/\/localhost:3100\/api\/auth\/verify-email\?[^\s]+/)[0];
r=await auth(link.split('/api/auth/')[1]);assert.ok([200,302].includes(r.status),'email verification');
r=await auth('sign-in/email',{email,password});assert.equal(r.status,200,JSON.stringify(r.data));
r=await auth('token');assert.equal(r.status,200);let token=r.data.token;assert.ok(token);
const orders=await fetch(api+'/v1/orders',{headers:{Authorization:`Bearer ${token}`,Origin:web}});assert.equal(orders.status,200);assert.deepEqual(await orders.json(),[]);
assert.equal((await fetch(api+'/v1/admin/orders',{headers:{Authorization:`Bearer ${token}`}})).status,403);
assert.equal((await fetch(api+'/v1/orders')).status,401);
assert.equal((await fetch(api+'/v1/orders',{headers:{Authorization:'Bearer forged'}})).status,401);
assert.equal((await fetch(api+'/v1/draws',{headers:{Origin:'https://untrusted.example'}})).status,403);
const methods=await(await fetch(api+'/v1/payment-methods?currency=ETB')).json();assert.deepEqual(methods,[],'checkout stays disabled without keys');
// Prove staff access requires MFA, and other players' orders stay private.
const db=new Pool({connectionString:'postgres://rimna:local-development-only@localhost:55437/rimna?sslmode=disable'});
const uid=(await db.query('SELECT id FROM auth."user" WHERE email=$1',[email])).rows[0].id;
const drawId='integration-'+randomUUID(),ownId=randomUUID(),otherId=randomUUID();
try {
 await db.query("INSERT INTO staff(user_id,role) VALUES($1,'admin')",[uid]);
 assert.equal((await fetch(api+'/v1/admin/orders',{headers:{Authorization:`Bearer ${token}`}})).status,403,'MFA is mandatory for staff');
 r=await auth('two-factor/enable',{password});assert.equal(r.status,200,JSON.stringify(r.data));
 const secret=new URL(r.data.totpURI).searchParams.get('secret');let bits='';for(const c of secret)bits+='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c).toString(2).padStart(5,'0');
 const key=Buffer.from(bits.match(/.{8}/g).map(b=>parseInt(b,2))),counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));
 const hash=createHmac('sha1',key).update(counter).digest(),i=hash[19]&15,code=String((hash.readUInt32BE(i)&0x7fffffff)%1000000).padStart(6,'0');
 r=await auth('two-factor/verify-totp',{code});assert.equal(r.status,200,JSON.stringify(r.data));
 r=await auth('token');token=r.data.token;
 assert.equal((await fetch(api+'/v1/admin/orders',{headers:{Authorization:`Bearer ${token}`}})).status,200,'MFA staff access');
 await db.query("INSERT INTO draws(id,title,currency,price_minor,capacity,status,deadline) VALUES($1,'Integration','ETB',10000,25000,'closed',now()+interval '1 day')",[drawId]);
 for(const [id,user,n] of [[ownId,uid,1],[otherId,'other-player',2]])await db.query("INSERT INTO orders(id,user_id,draw_id,number,amount_minor,currency,provider,status,idempotency_key,fingerprint,phone,email,name,expires_at) VALUES($1,$2,$3,$4,10000,'ETB','legacy','paid',$1,$1,'+251911123456','test@example.test','Test',now())",[id,user,drawId,n]);
 assert.equal((await fetch(api+'/v1/orders/'+otherId,{headers:{Authorization:`Bearer ${token}`}})).status,404,'other owner cannot access ticket');
 const mine=await(await fetch(api+'/v1/orders?userId=other-player',{headers:{Authorization:`Bearer ${token}`}})).json();assert.deepEqual(mine.map(o=>o.id),[ownId]);
}finally{await db.query('DELETE FROM orders WHERE draw_id=$1',[drawId]);await db.query('DELETE FROM draws WHERE id=$1',[drawId]);await db.query('DELETE FROM staff WHERE user_id=$1',[uid]);await db.end()}
r=await auth('sign-out',{});assert.equal(r.status,200);
assert.equal((await fetch(api+'/v1/orders',{headers:{Authorization:`Bearer ${token}`}})).status,401,'logout revokes already issued JWT');
console.log('PASS: signup, unverified rejection, SMTP verification, login, JWT, own history, staff denial, forged tokens, origin check, disabled payments, MFA enforcement, cross-account isolation, logout revocation.');
