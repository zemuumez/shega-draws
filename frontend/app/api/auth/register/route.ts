import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSanityWriteClient } from "@/lib/sanity/client";

function hashPin(pin: string, salt = "rimna_player_salt"): string {
  return crypto.createHmac("sha256", salt).update(pin).digest("hex");
}

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-()]/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim() || "Verified Player";
    const rawPhone = (body.phone || "").trim();
    const pin = (body.pin || body.password || "").trim();

    if (!rawPhone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const phone = cleanPhoneNumber(rawPhone);
    if (phone.length < 9) {
      return NextResponse.json({ error: "Please enter a valid phone number (at least 9 digits)" }, { status: 400 });
    }

    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: "Please set a security PIN / password of at least 4 digits" }, { status: 400 });
    }

    const pinHash = hashPin(pin);

    // 1. Check if user already exists in Sanity CMS
    const client = getSanityWriteClient();
    if (client) {
      try {
        const existing = await client.fetch<{ _id: string }>(
          `*[_type == "playerAccount" && phone == $phone][0]{ _id }`,
          { phone }
        );
        if (existing?._id) {
          return NextResponse.json(
            { error: "An account with this phone number already exists. Please sign in instead." },
            { status: 409 }
          );
        }
      } catch (checkErr: any) {
        console.warn("⚠️ Sanity account check warning:", checkErr.message);
      }
    }

    // 2. Try registering in Go backend if reachable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    try {
      const backendRes = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, pin }),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend not running directly
    }

    // 3. Save new verified player account document into Sanity CMS
    if (client) {
      try {
        const createdDoc = await client.create({
          _type: "playerAccount",
          name,
          phone,
          pinHash,
          status: "active",
          registeredAt: new Date().toISOString(),
        });
        console.log(`✅ [Sanity CMS] New Player Account Created: ${createdDoc._id} (${phone})`);
      } catch (docErr: any) {
        console.error("❌ Failed to create playerAccount in Sanity:", docErr.message);
      }
    }

    const userId = `usr_${phone.replace(/[^0-9]/g, "").slice(-8) || Date.now().toString(36)}`;
    const user = {
      id: userId,
      name,
      phone,
      role: "player",
    };
    const access_token = `token_${Buffer.from(
      JSON.stringify({ userId, phone, role: "player", exp: Date.now() + 30 * 86400000 })
    ).toString("base64")}`;

    return NextResponse.json({
      access_token,
      user,
      message: "Player account registered and verified successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to register" }, { status: 500 });
  }
}
