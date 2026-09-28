export interface LotteryRules {
  deductions: { label: string; bps: number }[];
  prizeBps: number[];
}
export interface LotterySettings {
  title: string;
  currency: "ETB" | "USD";
  priceMinor: number;
  capacity: number;
  rules: LotteryRules;
}
export interface LotteryTemplate extends LotterySettings {
  id: string;
  version: number;
  active: boolean;
}
export interface AdminRound {
  id: string;
  title: string;
  currency: "ETB" | "USD";
  priceMinor: number;
  capacity: number;
  deadline: string;
  liveVideoUrl: string;
  templateId: string;
  templateVersion: number;
  version: number;
  rules: LotteryRules | null;
  state: "draft" | "open" | "paused" | "closed" | "completed";
  startedAt: string | null;
  closedAt: string | null;
  sold: number;
  occupied: number;
  remaining: number;
  currentNetMinor: number | null;
  maximumNetMinor: number | null;
}
export interface LotteryPage<T> {
  items: T[];
  hasMore: boolean;
}
// Convert entered decimal text exactly; do not round a third decimal silently.
export function hundredths(text: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(text))
    throw new Error("Use a positive amount with at most two decimal places.");
  const [whole, fraction = ""] = text.split(".");
  const value = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(value)) throw new Error("Amount is too large.");
  return value;
}
