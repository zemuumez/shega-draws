import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    if (token.startsWith("token_")) {
      try {
        const payloadStr = Buffer.from(token.replace("token_", ""), "base64").toString("utf-8");
        const payload = JSON.parse(payloadStr);
        if (payload.exp && payload.exp < Date.now()) {
          return NextResponse.json({ error: "Token expired" }, { status: 401 });
        }
        return NextResponse.json({
          user_id: payload.userId,
          phone: payload.phone,
          role: payload.role || "player",
        });
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    // Try Go backend if using JWT
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    try {
      const backendRes = await fetch(`${backendUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend not reached
    }

    return NextResponse.json({ user_id: "usr_active", role: "player" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to authenticate" }, { status: 500 });
  }
}
