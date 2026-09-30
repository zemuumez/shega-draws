import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { id, reference, status } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid deposit id" }, { status: 400 });
    }

    if (!reference || typeof reference !== "string") {
      return NextResponse.json({ error: "Missing or invalid payment reference" }, { status: 400 });
    }

    // In a real Chapa webhook, the payload looks like this:
    const payload = {
      chapa_reference: reference,
      webhook_type: "payment",
      mode: "test",
      merchant_reference: id,
      status: status || "success",
    };

    const rawBody = JSON.stringify(payload);
    const secret =
      process.env.CHAPA_WEBHOOK_SECRET ||
      "8e7bb425c12d9fa7690e68e22e871f59f1189ce8b36b4ab8b7272776c9d570a3";

    const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const webhookRes = await fetch(`${apiBase}/v1/webhooks/chapa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Chapa-Signature": signature,
      },
      body: rawBody,
    });

    if (!webhookRes.ok) {
      const errText = await webhookRes.text();
      return NextResponse.json(
        { error: `Backend webhook rejected: ${errText || webhookRes.statusText}` },
        { status: webhookRes.status }
      );
    }

    // Small delay to allow the 1-second backend worker to reconcile and post the wallet entry
    await new Promise((r) => setTimeout(r, 800));

    return NextResponse.json({
      success: true,
      reference,
      merchantReference: id,
      message: "Chapa mock payment verified and credited to ledger.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to simulate Chapa payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
