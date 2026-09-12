import { NextResponse } from "next/server";

// Keep player traffic on the website origin so refresh cookies work on Vercel.
export async function backendProxy(request: Request, path: string, method = request.method) {
  const origin = request.headers.get("origin");
  if (method !== "GET" && origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const headers = new Headers();
  // Vercel supplies this client IP; avoid grouping every visitor under the proxy IP.
  // https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for
  if (process.env.VERCEL === "1") {
    const ip = request.headers.get("x-vercel-forwarded-for");
    if (ip) headers.set("x-real-ip", ip);
  }
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const refreshCookie = request.headers.get("cookie")?.split(";").map(c => c.trim())
    .find(c => c.startsWith("refresh_token="));
  if (refreshCookie && path.startsWith("/auth/")) headers.set("cookie", refreshCookie);

  try {
    const base = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");
    const upstream = await fetch(`${base}${path}`, {
      method, headers, cache: "no-store", redirect: "error",
      body: method === "GET" ? undefined : await request.arrayBuffer(),
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json();
    const response = NextResponse.json(data, { status: upstream.status });
    response.headers.set("Cache-Control", "no-store");
    const retryAfter = upstream.headers.get("retry-after");
    if (retryAfter) response.headers.set("Retry-After", retryAfter);
    const cookie = upstream.headers.get("set-cookie");
    if (cookie) {
      const value = /(?:^|;\s*)refresh_token=([^;]*)/.exec(cookie)?.[1];
      const maxAge = /max-age=(-?\d+)/i.exec(cookie)?.[1];
      if (value !== undefined) response.cookies.set("refresh_token", value, {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "strict", path: "/api/auth", maxAge: maxAge ? Number(maxAge) : undefined,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ error: "The server is temporarily unavailable. Please try again." }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
