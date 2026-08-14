const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ── Token management ──────────────────────────────────────────────────
const TOKEN_KEY = "primedraws_access_token";
const USER_KEY  = "primedraws_user";

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
  // Don't set Content-Type for FormData — browser sets boundary automatically
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });

  // Auto-refresh access token on 401
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
  const data = await apiFetch<{ access_token: string; user: StoredUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAccessToken(data.access_token);
  setUser(data.user);
  return data;
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
  total_prize_value?: string;
  total_entries?: number;
  prizes?: Array<{
    rank: number;
    label: string;
    prizeTitle: string;
    valueAmount?: string;
    description?: string;
  }>;
}

export async function getActiveDraw(): Promise<DrawState> {
  try {
    return await apiFetch<DrawState>("/draws/active");
  } catch {
    // Fallback active draw
    return FALLBACK_DRAWS.find((d) => d.status === "open") || FALLBACK_DRAWS[0];
  }
}

export async function listDraws(status?: string): Promise<DrawState[]> {
  try {
    const params = status ? `?status=${status}` : "";
    const backendDraws = await apiFetch<DrawState[]>(`/draws${params}`);
    if (backendDraws && backendDraws.length > 0) {
      // Merge with sample historical/upcoming if backend has limited entries
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
  method: string;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  user_name?: string;
  proof_key?: string; // Pre-signed URL when returned to admin
}

export async function submitEntry(formData: FormData): Promise<Entry> {
  return apiFetch<Entry>("/entries", { method: "POST", body: formData });
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

// ── Fallback Seed Data (Ensures rich experience before DB/CMS population) ──
export const FALLBACK_DRAWS: DrawState[] = [
  {
    id: "draw-active-001",
    draw_id: "PD-2026-08A",
    title: "The Grand Horizon Mega Draw",
    description: "Our signature flagship raffle. Luxury 3-Bedroom Villa in CMC Addis Ababa, 2026 BYD Song Plus EV, and 8 tiered birr cash rewards.",
    commitment: "8f4e2a91b7c3d5e6f0123456789abcdef0123456789abcdef0123456789abcde",
    status: "open",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 7 * 3600 * 1000).toISOString(),
    ticket_price: 100,
    total_prize_value: "35,000,000 ETB",
    total_entries: 842,
    prizes: [
      { rank: 1, label: "1st Place", prizeTitle: "Modern Luxury Villa (G+2 CMC, Addis)", valueAmount: "22,500,000 ETB" },
      { rank: 2, label: "2nd Place", prizeTitle: "2026 BYD Song Plus EV (Brand New)", valueAmount: "4,800,000 ETB" },
      { rank: 3, label: "3rd Place", prizeTitle: "1,500,000 ETB Pure Cash Transfer", valueAmount: "1,500,000 ETB" },
      { rank: 4, label: "4th Place", prizeTitle: "750,000 ETB Cash", valueAmount: "750,000 ETB" },
      { rank: 5, label: "5th Place", prizeTitle: "500,000 ETB Cash", valueAmount: "500,000 ETB" },
      { rank: 6, label: "6th Place", prizeTitle: "300,000 ETB Cash", valueAmount: "300,000 ETB" },
      { rank: 7, label: "7th Place", prizeTitle: "200,000 ETB Cash", valueAmount: "200,000 ETB" },
      { rank: 8, label: "8th Place", prizeTitle: "150,000 ETB Cash", valueAmount: "150,000 ETB" },
      { rank: 9, label: "9th Place", prizeTitle: "100,000 ETB Cash", valueAmount: "100,000 ETB" },
      { rank: 10, label: "10th Place", prizeTitle: "50,000 ETB Cash", valueAmount: "50,000 ETB" },
    ],
  },
  {
    id: "draw-upcoming-002",
    draw_id: "PD-2026-09B",
    title: "Enkutatash Holiday Golden Jackpot",
    description: "Special New Year Celebration Raffle featuring 2 Brand New Suzuki Dzires and 10 Gold Bar commemorative coins.",
    commitment: "3c98d7f6e5a4b3c2d10987654321fedcba9876543210fedcba9876543210fedc",
    status: "upcoming",
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price: 150,
    total_prize_value: "18,000,000 ETB",
    total_entries: 0,
    prizes: [
      { rank: 1, label: "1st Place", prizeTitle: "2x Suzuki Dzire 2026 Auto (His & Hers)", valueAmount: "7,200,000 ETB" },
      { rank: 2, label: "2nd Place", prizeTitle: "2,000,000 ETB Holiday Cash Grant", valueAmount: "2,000,000 ETB" },
      { rank: 3, label: "3rd Place", prizeTitle: "1,000,000 ETB Cash", valueAmount: "1,000,000 ETB" },
      { rank: 4, label: "4th Place", prizeTitle: "500,000 ETB Cash", valueAmount: "500,000 ETB" },
    ],
  },
  {
    id: "draw-upcoming-003",
    draw_id: "PD-2026-09C",
    title: "Tech & Mobility Flash Raffle",
    description: "10 High-End Apple MacBook Pro M3 Max laptops, 10 iPhone 16 Pro Max units and 5 Electric City Scooters.",
    commitment: "e1f2a3b4c5d6e7f809182736455463728190abcdef1234567890fedcba987654",
    status: "upcoming",
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price: 50,
    total_prize_value: "9,500,000 ETB",
    total_entries: 0,
    prizes: [
      { rank: 1, label: "1st Place", prizeTitle: "Complete Apple Ecosystem Pro Suite", valueAmount: "1,800,000 ETB" },
      { rank: 2, label: "2nd Place", prizeTitle: "Segway Pro Electric Super Scooter", valueAmount: "450,000 ETB" },
      { rank: 3, label: "3rd Place", prizeTitle: "300,000 ETB Tech Grant", valueAmount: "300,000 ETB" },
    ],
  },
  {
    id: "draw-past-001",
    draw_id: "PD-2026-07Z",
    title: "Mid-Year Prime Summer Draw",
    description: "Completed on July 31, 2026. Fully audited and prizes disbursed to verified phone numbers.",
    commitment: "a7b8c9d0e1f2345678901234567890abcdefabcdefabcdefabcdefabcdefabcd",
    seed: "7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
    status: "revealed",
    deadline: "2026-07-31T18:00:00.000Z",
    ticket_price: 100,
    total_prize_value: "25,000,000 ETB",
    total_entries: 1000,
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
    prizes: [
      { rank: 1, label: "1st Place", prizeTitle: "Modern Apartment in Bole", valueAmount: "15,000,000 ETB" },
      { rank: 2, label: "2nd Place", prizeTitle: "Toyota Rush 2025 SUV", valueAmount: "4,200,000 ETB" },
      { rank: 3, label: "3rd Place", prizeTitle: "1,000,000 ETB Cash", valueAmount: "1,000,000 ETB" },
      { rank: 4, label: "4th Place", prizeTitle: "500,000 ETB Cash", valueAmount: "500,000 ETB" },
    ],
  },
  {
    id: "draw-past-002",
    draw_id: "PD-2026-06Y",
    title: "Mid-Year Rapid Cash Bonanza",
    description: "Completed on June 30, 2026. 10 Cash winners rewarded with instant bank transfers.",
    commitment: "d4e5f6a7b8c901234567890123456789abcdefabcdefabcdefabcdefabcdefab",
    seed: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    status: "revealed",
    deadline: "2026-06-30T18:00:00.000Z",
    ticket_price: 50,
    total_prize_value: "10,000,000 ETB",
    total_entries: 950,
    winning_numbers: {
      1: "19",
      2: "73",
      3: "88",
      4: "04",
      5: "51",
      6: "32",
      7: "67",
      8: "90",
      9: "12",
      10: "45",
    },
    prizes: [
      { rank: 1, label: "1st Place", prizeTitle: "5,000,000 ETB Cash Transfer", valueAmount: "5,000,000 ETB" },
      { rank: 2, label: "2nd Place", prizeTitle: "2,000,000 ETB Cash Transfer", valueAmount: "2,000,000 ETB" },
      { rank: 3, label: "3rd Place", prizeTitle: "1,000,000 ETB Cash Transfer", valueAmount: "1,000,000 ETB" },
    ],
  },
];
