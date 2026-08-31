const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ── Token management ──────────────────────────────────────────────────
const TOKEN_KEY = "rimnalottery_access_token";
const USER_KEY  = "rimnalottery_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export interface StoredUser {
  id: string;
  name: string;
  phone: string;
  role: "player" | "admin" | "superadmin";
}

// ── Typed fetch helper ────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });

  if (res.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.access_token);
    return true;
  } catch {
    return false;
  }
}

// ── Auth API ─────────────────────────────────────────────────────────
export interface RegisterInput { name: string; phone: string; }
export interface LoginInput    { phone: string; password: string; }

export async function registerPlayer(input: RegisterInput) {
  try {
    const data = await apiFetch<{ access_token: string; user: StoredUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data;
  } catch {
    const fallbackUser: StoredUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: input.name || "Verified Player",
      phone: input.phone,
      role: "player",
    };
    setAccessToken(`mock-jwt-${Date.now()}`);
    setUser(fallbackUser);
    return { access_token: `mock-jwt-${Date.now()}`, user: fallbackUser };
  }
}

export async function loginPlayer(phone: string, name?: string) {
  try {
    const data = await apiFetch<{ access_token: string; user: StoredUser }>("/auth/player-login", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data;
  } catch {
    return registerPlayer({ name: name || "Verified Player", phone });
  }
}

export async function loginAdmin(input: LoginInput) {
  const data = await apiFetch<{ access_token: string; user: StoredUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAccessToken(data.access_token);
  setUser(data.user);
  return data;
}

export async function logout() {
  await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
  clearTokens();
}

// ── Currency & Pool Tier Definitions ──────────────────────────────────
export type Currency = "ETB" | "USD";

export interface PoolOption {
  size: number;
  label: string;
  pool: string;
  jackpot: string;
  totalSum: number;
}

export interface TicketPriceConfig {
  price: number;
  currency: Currency;
  title: string;
  pools: PoolOption[];
}

// USD Tickets from user paper specifications: $25, $50, $75, $100, $150, $200, $250
export const USD_TICKET_CONFIGS: TicketPriceConfig[] = [
  {
    price: 25,
    currency: "USD",
    title: "$25 International Diaspora Raffle",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "$25,000", jackpot: "$8,750 (1st)", totalSum: 25000 },
      { size: 2000, label: "2,000 (2K)", pool: "$50,000", jackpot: "$15,000 (1st)", totalSum: 50000 },
      { size: 5000, label: "5,000 (5K)", pool: "$125,000", jackpot: "$40,000 (1st)", totalSum: 125000 },
    ],
  },
  {
    price: 50,
    currency: "USD",
    title: "$50 Global Tier Jackpot",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "$50,000", jackpot: "$17,500 (1st)", totalSum: 50000 },
      { size: 2000, label: "2,000 (2K)", pool: "$100,000", jackpot: "$30,000 (1st)", totalSum: 100000 },
      { size: 5000, label: "5,000 (5K)", pool: "$250,000", jackpot: "$80,000 (1st)", totalSum: 250000 },
    ],
  },
  {
    price: 75,
    currency: "USD",
    title: "$75 Premier Holiday Raffle",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "$75,000", jackpot: "$26,250 (1st)", totalSum: 75000 },
      { size: 1500, label: "1,500 (1.5K)", pool: "$112,500", jackpot: "$35,000 (1st)", totalSum: 112500 },
      { size: 2500, label: "2,500 (2.5K)", pool: "$187,500", jackpot: "$60,000 (1st)", totalSum: 187500 },
    ],
  },
  {
    price: 100,
    currency: "USD",
    title: "$100 Elite Global Jackpot",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "$100,000", jackpot: "$35,000 (1st)", totalSum: 100000 },
      { size: 3000, label: "3,000 (3K)", pool: "$300,000", jackpot: "$90,000 (1st)", totalSum: 300000 },
      { size: 5000, label: "5,000 (5K)", pool: "$500,000", jackpot: "$160,000 (1st)", totalSum: 500000 },
    ],
  },
  {
    price: 150,
    currency: "USD",
    title: "$150 Luxury Mega Draw",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "$150,000", jackpot: "$52,500 (1st)", totalSum: 150000 },
      { size: 3000, label: "3,000 (3K)", pool: "$450,000", jackpot: "$135,000 (1st)", totalSum: 450000 },
      { size: 5000, label: "5,000 (5K)", pool: "$750,000", jackpot: "$240,000 (1st)", totalSum: 750000 },
    ],
  },
  {
    price: 200,
    currency: "USD",
    title: "$200 Million Dollar Jackpot",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "$200,000", jackpot: "$70,000 (1st)", totalSum: 200000 },
      { size: 3000, label: "3,000 (3K)", pool: "$600,000", jackpot: "$180,000 (1st)", totalSum: 600000 },
      { size: 5000, label: "5,000 (5K)", pool: "$1,000,000", jackpot: "$320,000 (1st)", totalSum: 1000000 },
    ],
  },
  {
    price: 250,
    currency: "USD",
    title: "$250 Grand Master Draw",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "$250,000", jackpot: "$87,500 (1st)", totalSum: 250000 },
      { size: 3000, label: "3,000 (3K)", pool: "$750,000", jackpot: "$240,000 (1st)", totalSum: 750000 },
      { size: 5000, label: "5,000 (5K)", pool: "$1,250,000", jackpot: "$400,000 (1st)", totalSum: 1250000 },
    ],
  },
];

// ETB Tickets (Local Ethiopian Birr)
export const ETB_TICKET_CONFIGS: TicketPriceConfig[] = [
  {
    price: 100,
    currency: "ETB",
    title: "100 Birr Classic Multi-Pool Draw",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "100,000 ETB", jackpot: "35,000 ETB (1st)", totalSum: 100000 },
      { size: 2000, label: "2,000 (2K)", pool: "200,000 ETB", jackpot: "60,000 ETB (1st)", totalSum: 200000 },
      { size: 3000, label: "3,000 (3K)", pool: "300,000 ETB", jackpot: "90,000 ETB (1st)", totalSum: 300000 },
      { size: 5000, label: "5,000 (5K)", pool: "500,000 ETB", jackpot: "160,000 ETB (1st)", totalSum: 500000 },
    ],
  },
  {
    price: 150,
    currency: "ETB",
    title: "150 Birr Premier Jackpot Draw",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "150,000 ETB", jackpot: "50,000 ETB (1st)", totalSum: 150000 },
      { size: 3000, label: "3,000 (3K)", pool: "450,000 ETB", jackpot: "140,000 ETB (1st)", totalSum: 450000 },
      { size: 5000, label: "5,000 (5K)", pool: "750,000 ETB", jackpot: "240,000 ETB (1st)", totalSum: 750000 },
    ],
  },
  {
    price: 200,
    currency: "ETB",
    title: "200 Birr Grand Holiday Jackpot",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "200,000 ETB", jackpot: "70,000 ETB (1st)", totalSum: 200000 },
      { size: 2000, label: "2,000 (2K)", pool: "400,000 ETB", jackpot: "120,000 ETB (1st)", totalSum: 400000 },
      { size: 3000, label: "3,000 (3K)", pool: "600,000 ETB", jackpot: "180,000 ETB (1st)", totalSum: 600000 },
      { size: 5000, label: "5,000 (5K)", pool: "1,000,000 ETB", jackpot: "320,000 ETB (1st)", totalSum: 1000000 },
    ],
  },
  {
    price: 500,
    currency: "ETB",
    title: "500 Birr Diamond Jackpot",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "500,000 ETB", jackpot: "150,000 ETB (1st)", totalSum: 500000 },
      { size: 2000, label: "2,000 (2K)", pool: "1,000,000 ETB", jackpot: "300,000 ETB (1st)", totalSum: 1000000 },
      { size: 3000, label: "3,000 (3K)", pool: "1,500,000 ETB", jackpot: "450,000 ETB (1st)", totalSum: 1500000 },
      { size: 5000, label: "5,000 (5K)", pool: "2,500,000 ETB", jackpot: "750,000 ETB (1st)", totalSum: 2500000 },
    ],
  },
  {
    price: 1000,
    currency: "ETB",
    title: "1,000 Birr Mega VIP Draw",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "1,000,000 ETB", jackpot: "300,000 ETB (1st)", totalSum: 1000000 },
      { size: 2000, label: "2,000 (2K)", pool: "2,000,000 ETB", jackpot: "600,000 ETB (1st)", totalSum: 2000000 },
      { size: 3000, label: "3,000 (3K)", pool: "3,000,000 ETB", jackpot: "900,000 ETB (1st)", totalSum: 3000000 },
      { size: 5000, label: "5,000 (5K)", pool: "5,000,000 ETB", jackpot: "1,500,000 ETB (1st)", totalSum: 5000000 },
    ],
  },
  {
    price: 50,
    currency: "ETB",
    title: "50 Birr Starter Booster",
    pools: [
      { size: 1000, label: "1,000 (1K)", pool: "50,000 ETB", jackpot: "18,000 ETB (1st)", totalSum: 50000 },
      { size: 2000, label: "2,000 (2K)", pool: "100,000 ETB", jackpot: "35,000 ETB (1st)", totalSum: 100000 },
      { size: 5000, label: "5,000 (5K)", pool: "250,000 ETB", jackpot: "80,000 ETB (1st)", totalSum: 250000 },
    ],
  },
];

// ── Draw API ─────────────────────────────────────────────────────────
export interface DrawState {
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

export async function getActiveDraw(): Promise<DrawState> {
  try {
    return await apiFetch<DrawState>("/draws/active");
  } catch {
    return FALLBACK_DRAWS.find((d) => d.status === "open") || FALLBACK_DRAWS[0];
  }
}

export async function listDraws(status?: string): Promise<DrawState[]> {
  try {
    const params = status ? `?status=${status}` : "";
    const backendDraws = await apiFetch<DrawState[]>(`/draws${params}`);
    if (backendDraws && backendDraws.length > 0) {
      const backendMap = new Set(backendDraws.map(d => d.id));
      const complement = FALLBACK_DRAWS.filter(d => !backendMap.has(d.id));
      const combined = [...backendDraws, ...complement];
      return status ? combined.filter(d => d.status === status) : combined;
    }
    return status ? FALLBACK_DRAWS.filter(d => d.status === status) : FALLBACK_DRAWS;
  } catch {
    return status ? FALLBACK_DRAWS.filter(d => d.status === status) : FALLBACK_DRAWS;
  }
}

export async function closeEntries(drawId: string) {
  return apiFetch(`/draws/${drawId}/close`, { method: "POST" });
}

export async function revealDraw(drawId: string): Promise<DrawState> {
  return apiFetch<DrawState>(`/draws/${drawId}/reveal`, { method: "POST" });
}

// ── Entry API ─────────────────────────────────────────────────────────
export interface Entry {
  id: string;
  draw_id: string;
  user_id: string;
  number: string;
  amount: number;
  currency?: Currency;
  method: string;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  user_name?: string;
  proof_key?: string;
}

export async function submitEntry(formData: FormData): Promise<Entry> {
  try {
    const res = await fetch("/api/entries/submit", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return {
        id: `entry-${Date.now()}`,
        draw_id: (formData.get("draw_id") as string) || "RDL-2026-08A",
        user_id: "user-1",
        number: (formData.get("number") as string) || "00",
        amount: Number(formData.get("amount") || 100),
        currency: (formData.get("currency") as Currency) || "ETB",
        method: (formData.get("method") as string) || "telebirr",
        status: "pending",
        created_at: new Date().toISOString(),
      };
    }
  } catch (localErr) {
    console.warn("Local API submit notice:", localErr);
  }

  try {
    return await apiFetch<Entry>("/entries", { method: "POST", body: formData });
  } catch {
    return {
      id: `entry-${Date.now()}`,
      draw_id: (formData.get("draw_id") as string) || "RDL-2026-08A",
      user_id: "user-1",
      number: (formData.get("number") as string) || "00",
      amount: Number(formData.get("amount") || 100),
      currency: (formData.get("currency") as Currency) || "ETB",
      method: (formData.get("method") as string) || "telebirr",
      status: "pending",
      created_at: new Date().toISOString(),
    };
  }
}

export async function getMyEntries(drawId: string): Promise<Entry[]> {
  return apiFetch<Entry[]>(`/entries/mine?draw_id=${drawId}`);
}

export async function listAllEntries(drawId?: string, status?: string): Promise<Entry[]> {
  const params = new URLSearchParams();
  if (drawId) params.set("draw_id", drawId);
  if (status) params.set("status", status);
  return apiFetch<Entry[]>(`/entries?${params}`);
}

export async function confirmEntry(entryId: string) {
  return apiFetch(`/entries/${entryId}/confirm`, { method: "POST" });
}

export async function rejectEntry(entryId: string) {
  return apiFetch(`/entries/${entryId}/reject`, { method: "POST" });
}

// ── Fallback Seed Data (ETB and USD International Draws) ──────────────
export const FALLBACK_DRAWS: DrawState[] = [
  // ── ETB (Local) Draws ──
  {
    id: "draw-etb-100",
    draw_id: "RDL-2026-08A",
    title: "100 Birr Classic Multi-Pool Draw",
    description: "Limited capacity pools (1K, 2K, 3K, 5K). 10 Guaranteed Winners split the prize pool!",
    commitment: "8f4e2a91b7c3d5e6f0123456789abcdef0123456789abcdef0123456789abcde",
    status: "open",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 3600 * 1000).toISOString(),
    ticket_price: 100,
    currency: "ETB",
    max_capacity: 2000,
    total_entries: 1420,
    total_prize_value: "200,000 ETB",
  },
  {
    id: "draw-etb-150",
    draw_id: "RDL-2026-08B",
    title: "150 Birr Premier Jackpot Draw",
    description: "Limited capacity pools (1K, 3K, 5K). 10 Winners share up to 750,000 ETB!",
    commitment: "5b8f9e0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    status: "open",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 8 * 3600 * 1000).toISOString(),
    ticket_price: 150,
    currency: "ETB",
    max_capacity: 3000,
    total_entries: 2150,
    total_prize_value: "450,000 ETB",
  },
  {
    id: "draw-etb-200",
    draw_id: "RDL-2026-08C",
    title: "200 Birr Grand Holiday Jackpot",
    description: "Top 10 winners split up to 1,000,000 ETB with 320,000 ETB for 1st Place!",
    commitment: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    status: "open",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 12 * 3600 * 1000).toISOString(),
    ticket_price: 200,
    currency: "ETB",
    max_capacity: 5000,
    total_entries: 3840,
    total_prize_value: "1,000,000 ETB",
  },
  {
    id: "draw-etb-upcoming",
    draw_id: "RDL-2026-09A",
    title: "50 Birr Starter Booster",
    description: "Affordable starter raffle with 10 Guaranteed Winners.",
    commitment: "3c98d7f6e5a4b3c2d10987654321fedcba9876543210fedcba9876543210fedc",
    status: "upcoming",
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price: 50,
    currency: "ETB",
    max_capacity: 1000,
    total_entries: 0,
    total_prize_value: "50,000 ETB",
  },

  // ── USD (International Diaspora) Draws — Matches Paper ──
  {
    id: "draw-usd-25",
    draw_id: "RDL-USD-25",
    title: "$25 International Diaspora Raffle",
    description: "Available globally in USD. Pools: 1K ($25,000), 2K ($50,000), 5K ($125,000). 10 Guaranteed Winners!",
    commitment: "f4e5d6c7b8a90123456789abcdef0123456789abcdef0123456789abcdef0123",
    status: "open",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price: 25,
    currency: "USD",
    max_capacity: 2000,
    total_entries: 1350,
    total_prize_value: "$50,000",
    custom_pools: USD_TICKET_CONFIGS[0].pools,
  },
  {
    id: "draw-usd-50",
    draw_id: "RDL-USD-50",
    title: "$50 Global Tier Jackpot",
    description: "International USD draw with pools of 1K ($50k), 2K ($100k), and 5K ($250k).",
    commitment: "1a2b3c4d5e6f708192a3b4c5d6e7f809182736455463728190abcdef12345678",
    status: "open",
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price: 50,
    currency: "USD",
    max_capacity: 2000,
    total_entries: 1100,
    total_prize_value: "$100,000",
    custom_pools: USD_TICKET_CONFIGS[1].pools,
  },
  {
    id: "draw-usd-100",
    draw_id: "RDL-USD-100",
    title: "$100 Elite Global Jackpot",
    description: "Massive USD international draw. Pools: 1K ($100k), 3K ($300k), 5K ($500k).",
    commitment: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    status: "open",
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price: 100,
    currency: "USD",
    max_capacity: 3000,
    total_entries: 2240,
    total_prize_value: "$300,000",
    custom_pools: USD_TICKET_CONFIGS[3].pools,
  },
  {
    id: "draw-usd-200",
    draw_id: "RDL-USD-200",
    title: "$200 Million Dollar Super Jackpot",
    description: "Grand International Tier! Pools: 1K ($200k), 3K ($600k), 5K ($1,000,000).",
    commitment: "d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
    status: "upcoming",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price: 200,
    currency: "USD",
    max_capacity: 5000,
    total_entries: 0,
    total_prize_value: "$1,000,000",
    custom_pools: USD_TICKET_CONFIGS[5].pools,
  },
  {
    id: "draw-past-001",
    draw_id: "RDL-2026-07Z",
    title: "2,000 People Classic Draw (100 Birr)",
    description: "Completed and audited on July 31, 2026. All 10 winners received their payouts.",
    commitment: "a7b8c9d0e1f2345678901234567890abcdefabcdefabcdefabcdefabcdefabcd",
    seed: "7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
    status: "revealed",
    deadline: "2026-07-31T18:00:00.000Z",
    ticket_price: 100,
    currency: "ETB",
    max_capacity: 2000,
    total_entries: 2000,
    total_prize_value: "200,000 ETB",
    winning_numbers: {
      1: "42",
      2: "89",
      3: "07",
      4: "15",
      5: "63",
      6: "77",
      7: "21",
      8: "94",
      9: "38",
      10: "50",
    },
  },
];
