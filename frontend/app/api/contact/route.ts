import {NextResponse} from 'next/server';
import {getSanityWriteClient} from '@/lib/sanity/client';
export async function POST(request: Request) {
  let body: any;
  try {body = await request.json();} catch {return NextResponse.json({error:'Invalid message.'}, {status:400});}
  const {name = '', phone, email = '', topic = 'general', message} = body || {};
  if (typeof phone !== 'string' || !/^\+?[\d ()-]{7,30}$/.test(phone.trim()) || phone.replace(/\D/g,'').length < 7 || typeof message !== 'string' || !message.trim() || message.length > 5000 || typeof name !== 'string' || name.length > 120 || typeof email !== 'string' || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) || typeof topic !== 'string' || topic.length > 100) {
    return NextResponse.json({error:'Enter a valid phone number and message (up to 5,000 characters).'}, {status:400});
  }
  const client = getSanityWriteClient();
  if (!client) return NextResponse.json({error:'Messages are temporarily unavailable. Please contact us by phone.'}, {status:503});
  try {
    await client.create({_id:`private.contact.${crypto.randomUUID()}`, _type:'contactMessage', name:name.trim() || 'Anonymous User', phone:phone.trim(), email:email.trim(), subject:topic, message:message.trim(), submittedAt:new Date().toISOString(), status:'unread'});
    return NextResponse.json({success:true});
  } catch {return NextResponse.json({error:'Your message could not be saved. Please try again.'}, {status:503});}
}
