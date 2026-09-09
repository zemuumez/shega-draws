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
    const rawPhone = (body.phone || "").trim();
    const pin = (body.pin || body.password || "").trim();

    if (!rawPhone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const phone = cleanPhoneNumber(rawPhone);

    // 1. Try forwarding to Go backend if available
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
    } catch {
      // Backend not running directly
    }

    // 2. Query real playerAccount in Sanity CMS
    const client = getSanityWriteClient();
    if (!client) {
      return NextResponse.json(
        { error: "Database service unavailable. Please check system configuration." },
        { status: 503 }
      );
    }

    const cleanDigits = phone.replace(/[^0-9]/g, "");
    const shortPhone = cleanDigits.length >= 9 ? cleanDigits.slice(-9) : cleanDigits;

    const playerDoc = await client.fetch<{
      _id: string;
      name: string;
      phone: string;
      pinHash?: string;
      status?: string;
    }>(
      `*[_type == "playerAccount" && (phone == $phone || phone match $shortPattern)][0]{
        _id,
        name,
        phone,
        pinHash,
        status
      }`,
      { phone, shortPattern: `*${shortPhone}` }
    );

    // If playerAccount not found, check if they exist as a legacy player in playerEntry
    if (!playerDoc) {
      const existingEntry = await client.fetch<{ playerName?: string; playerPhone?: string }>(
        `*[_type == "playerEntry" && (playerPhone == $phone || playerPhone match $shortPattern)][0]{ playerName, playerPhone }`,
        { phone, shortPattern: `*${shortPhone}` }
      );

      if (!existingEntry) {
        return NextResponse.json(
          {
            error: `No registered account found for phone "${rawPhone}". Please click "Register" to create your new player account.`,
          },
          { status: 404 }
        );
      }

      // If they had previous tickets but no PIN set, auto-register their playerAccount with the provided PIN
      if (pin && pin.length >= 4) {
        try {
          await client.create({
            _type: "playerAccount",
            name: existingEntry.playerName || "Verified Player",
            phone: existingEntry.playerPhone || phone,
            pinHash: hashPin(pin),
            status: "active",
            registeredAt: new Date().toISOString(),
          });
        } catch {
          // Ignore duplicate creation
        }
      }

      const userId = `usr_${cleanDigits || Date.now().toString(36)}`;
      const user = {
        id: userId,
        name: existingEntry.playerName || "Verified Player",
        phone: existingEntry.playerPhone || phone,
        role: "player",
      };
      const access_token = `token_${Buffer.from(
        JSON.stringify({ userId, phone, role: "player", exp: Date.now() + 30 * 86400000 })
      ).toString("base64")}`;

      return NextResponse.json({
        access_token,
        user,
        message: "Player authenticated successfully",
      });
    }

    // Account exists — verify security PIN if set
    if (playerDoc.pinHash) {
      if (!pin) {
        return NextResponse.json(
          { error: "Security PIN is required to sign in to your account." },
          { status: 400 }
        );
      }
      const expectedHash = hashPin(pin);
      if (playerDoc.pinHash !== expectedHash) {
        return NextResponse.json(
          { error: "Incorrect Security PIN. Please verify your PIN and try again." },
          { status: 401 }
        );
      }
    }

    if (playerDoc.status === "suspended") {
      return NextResponse.json(
        { error: "This player account has been suspended. Please contact customer support." },
        { status: 403 }
      );
    }

    const userId = `usr_${cleanDigits || Date.now().toString(36)}`;
    const user = {
      id: userId,
      name: playerDoc.name || "Verified Player",
      phone: playerDoc.phone || phone,
      role: "player",
    };
    const access_token = `token_${Buffer.from(
      JSON.stringify({ userId, phone, role: "player", exp: Date.now() + 30 * 86400000 })
    ).toString("base64")}`;

    return NextResponse.json({
      access_token,
      user,
      message: "Player signed in successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to sign in" }, { status: 500 });
  }
}
