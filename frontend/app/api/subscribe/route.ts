import {createHash} from 'node:crypto';
import {NextResponse} from 'next/server';
import {getSanityWriteClient} from '@/lib/sanity/client';
export async function POST(request: Request) {
  let value: unknown;
  try {value = (await request.json()).contact;} catch {return NextResponse.json({error:'Invalid contact.'}, {status:400});}
  if (typeof value !== 'string' || value.length > 254 || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || /^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value.trim()))) return NextResponse.json({error:'Enter an email address or Telegram @handle.'}, {status:400});
  const contact = value.trim().toLowerCase();
  const client = getSanityWriteClient();
  if (!client) return NextResponse.json({error:'Registration unavailable.'}, {status:503});
  try {
    await client.createIfNotExists({_id:`private.subscription.${createHash('sha256').update(contact).digest('hex')}`, _type:'contactMessage', name:contact, email:contact.startsWith('@') ? '' : contact, subject:'Community alerts registration', message:`Please register ${contact} for community draw updates.`, status:'unread', submittedAt:new Date().toISOString()});
    return NextResponse.json({success:true});
  } catch {return NextResponse.json({error:'Registration could not be saved.'}, {status:503});}
}
