import { NextResponse } from 'next/server';
import { getSanityWriteClient } from '@/lib/sanity/client';
import { createTicket, TicketError } from '@/lib/server/tickets';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request: Request) {
  const client = getSanityWriteClient();
  if (!client) return NextResponse.json({error: 'Ticket submissions are not configured yet.'}, {status: 503});
  if (Number(request.headers.get('content-length')) > 4 * 1024 * 1024) return NextResponse.json({error: 'Upload a screenshot up to 3 MB.'}, {status: 413});
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({error: 'Invalid request origin.'}, {status: 403});
  try {
    const form = await request.formData().catch(() => { throw new TicketError('Invalid ticket form.'); });
    return NextResponse.json(await createTicket(client, form), {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    return NextResponse.json({error: error instanceof TicketError ? error.message : 'Could not save your ticket. Please try again with the same form.'}, {status: error instanceof TicketError ? error.status : 503});
  }
}
