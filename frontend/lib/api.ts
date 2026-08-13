const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ── Token management ──────────────────────────────────────────────────
const TOKEN_KEY = "shega_access_token";
const USER_KEY  = "shega_user";

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
  sanity_id: string;
  commitment: string;
  status: "open" | "closed" | "revealed";
  deadline: string;
  winning_numbers?: Record<number, string>;
}

export async function getActiveDraw(): Promise<DrawState> {
  return apiFetch<DrawState>("/draws/active");
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
