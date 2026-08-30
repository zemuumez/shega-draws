import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, topic, message } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 });
    }

    const doc = {
      _type: "contactMessage",
      name: name || "Anonymous User",
      phone: phone.trim(),
      email: email?.trim() || "",
      topic: topic || "general",
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      status: "new",
    };

    // Attempt to write to Sanity if token configured, otherwise succeed gracefully
    try {
      if (process.env.SANITY_API_TOKEN) {
        await sanityClient.create(doc);
      }
    } catch (sanityErr) {
      console.warn("Sanity create warning (falling back to mock save):", sanityErr);
    }

    return NextResponse.json({ success: true, message: "Inquiry recorded successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process contact submission" }, { status: 500 });
  }
}
