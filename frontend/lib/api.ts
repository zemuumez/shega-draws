export type Currency = "ETB" | "USD";
export interface PoolOption { size: number; label: string; pool: string; jackpot: string; totalSum: number; }
export interface DrawState {
  taken_numbers?: string[];
  id: string;
  draw_id: string;
  sanity_id?: string;
  commitment: string;
  status: "open" | "closed" | "revealed" | "upcoming";
  deadline: string;
  winning_numbers?: Record<number, string>;
  seed?: string;
  title?: string;
  description?: string;
  ticket_price?: number;
  currency?: Currency;
  max_capacity?: number;
  total_prize_value?: string;
  total_entries?: number;
  prizes?: Array<{
    rank: number;
    label: string;
    prizeTitle: string;
    valueAmount?: string;
    description?: string;
  }>;
  custom_pools?: PoolOption[];
}


export async function submitEntry(formData: FormData): Promise<{id: string; status: "pending"}> {
  const res = await fetch("/api/entries/submit", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not submit your ticket. Please try again.");
  return data;
}
