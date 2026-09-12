import { NextResponse } from "next/server";
import { backendProxy } from "./backend-proxy";

export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  if (!request.headers.get("authorization")) {
    return NextResponse.json({ error: "Sign in as an administrator to manage receipts." }, { status: 401 });
  }
  const verified = await backendProxy(request, "/auth/me", "GET");
  if (!verified.ok) return verified;
  const user = await verified.json();
  if (user.role !== "admin" && user.role !== "superadmin") {
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  }
  return null;
}
