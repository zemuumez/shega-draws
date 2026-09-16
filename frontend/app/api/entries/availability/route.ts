import { NextResponse } from 'next/server';
import { getSanityWriteClient } from '@/lib/sanity/client';
import { ticketSelection, takenNumbers, TicketError } from '@/lib/server/tickets';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const client = getSanityWriteClient();
  if (!client) return NextResponse.json({error: 'Ticket sales are not configured yet.'}, {status: 503});
  try {
    const params = new URL(request.url).searchParams;
    const {selection} = await ticketSelection(client, params.get('currency') || '', Number(params.get('price')), Number(params.get('pool')));
    return NextResponse.json({selectionKey: selection.key, label: selection.label, currency: selection.currency, price: selection.ticketPrice, poolSize: selection.poolCapacity, takenNumbers: await takenNumbers(client, selection)}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    return NextResponse.json({error: error instanceof TicketError ? error.message : 'Unable to check ticket availability. Please try again.'}, {status: error instanceof TicketError ? error.status : 503});
  }
}
