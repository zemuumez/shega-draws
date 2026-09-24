export interface TicketDraw {
  _id: string; _rev?: string; drawId: string; title?: string;
  currency: 'ETB' | 'USD'; ticketPrice: number; poolCapacity: number;
  status: string; deadline?: string;
}
