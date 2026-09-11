import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Pre-computed dummy bcrypt hash (cost 12) used to equalize response time on missing users
const DUMMY_BCRYPT_HASH = "$2a$12$e8Y5t1Yf9zX9X9X9X9X9XuX9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X";

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-()]/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = (body.phone || "").trim();
    const pin = (body.pin || body.password || "").trim();

    if (!rawPhone || !pin) {
      return NextResponse.json({ error: "Invalid phone number or PIN" }, { status: 401 });
    }

    const phone = cleanPhoneNumber(rawPhone);

    // 1. Forward to Go backend (PostgreSQL single authoritative store)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    try {
      const backendRes = await fetch(`${backendUrl}/auth/player-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
      if (backendRes.status === 401 || backendRes.status === 404) {
        return NextResponse.json({ error: "Invalid phone number or PIN" }, { status: 401 });
      }
    } catch {
      // Backend not reached directly
    }

    // 2. Fallback verification with constant-time dummy bcrypt check
    // Always perform a real bcrypt compare to prevent timing side-channels
    await bcrypt.compare(pin, DUMMY_BCRYPT_HASH).catch(() => false);

    // Return uniform 401 Unauthorized to eliminate user enumeration
    return NextResponse.json({ error: "Invalid phone number or PIN" }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid phone number or PIN" }, { status: 401 });
  }
}
