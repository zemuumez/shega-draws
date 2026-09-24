"use client";
import { authClient } from "./auth-client";
import { apiBase } from "./backend";
// Memory only; never persist bearer tokens. Go still checks session revocation
// on every request. Sharing acquisition avoids a new auth request per ZIP image.
let cached: { token: string; until: number } | undefined;
let acquiring: Promise<string> | undefined;
export function clearAccountToken() {
  cached = undefined;
  acquiring = undefined;
}
async function token() {
  if (cached && cached.until > Date.now()) return cached.token;
  if (acquiring) return acquiring;
  acquiring = (async () => {
    const { data, error } = await authClient.token();
    if (error || !data?.token)
      throw new Error("Please sign in with a verified account.");
    cached = { token: data.token, until: Date.now() + 90000 };
    return data.token;
  })();
  try {
    return await acquiring;
  } finally {
    acquiring = undefined;
  }
}
export async function accountFetch(path: string, init: RequestInit = {}) {
  async function send() {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${await token()}`);
    return fetch(`${apiBase}/v1${path}`, {
      ...init,
      headers,
      signal: init.signal || AbortSignal.timeout(20000),
    });
  }
  const response = await send();
  if (response.status !== 401) return response;
  clearAccountToken();
  return send();
}
export async function accountAPI<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await accountFetch(path, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}
