export const apiBase = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");
export interface BackendDraw {
  id: string;
  title: string;
  currency: "ETB" | "USD";
  priceMinor: number;
  capacity: number;
  status: "open" | "closed" | "completed";
  deadline: string;
  liveVideoUrl: string;
  rules?: {
    deductions?: { label: string; bps: number }[];
    prizeBps?: number[];
  } | null;
  purchasedCount?: number;
  soldCount?: number;
  occupiedCount?: number;
}
export interface Order {
  id: string;
  drawId: string;
  number: number;
  amountMinor: number;
  currency: string;
  provider: string;
  status: string;
  refunded: boolean;
  phone: string;
  email: string;
  name: string;
  promoCode: string;
  checkoutUrl: string;
  paymentReference: string;
  expiresAt: string;
  createdAt: string;
}
export async function publicAPI<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiBase}/v1${path}`, {
    ...init,
    signal: init?.signal || AbortSignal.timeout(15000),
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error || "Service unavailable. Please try again.");
  return body;
}
export function compatibleDraw(d: BackendDraw) {
  return {
    ...d,
    _id: d.id,
    drawId: d.id,
    ticketPrice: d.priceMinor / 100,
    poolCapacity: d.capacity,
    purchasedCount: d.soldCount ?? d.purchasedCount ?? 0,
    soldCount: d.soldCount ?? d.purchasedCount ?? 0,
    occupiedCount: d.occupiedCount ?? d.soldCount ?? 0,
  };
}
