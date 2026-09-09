import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanity/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") || "";
    const drawId = searchParams.get("draw_id") || "";

    const entries: any[] = [];

    // 1. Fetch from Sanity CMS playerEntry documents if client is configured
    const client = getSanityWriteClient();
    if (client && phone) {
      try {
        // Clean phone for matching (e.g. last 9 digits)
        const cleanDigits = phone.replace(/[^0-9]/g, "");
        const shortPhone = cleanDigits.length >= 9 ? cleanDigits.slice(-9) : cleanDigits;

        const sanityQuery = drawId
          ? `*[_type == "playerEntry" && (playerPhone == $phone || playerPhone match $shortPattern) && drawId == $drawId] | order(submittedAt desc) {
              _id,
              playerName,
              playerPhone,
              drawId,
              luckyNumber,
              poolCapacity,
              amount,
              currency,
              paymentMethod,
              "proofScreenshotUrl": proofScreenshot.asset->url,
              status,
              adminNotes,
              submittedAt
            }`
          : `*[_type == "playerEntry" && (playerPhone == $phone || playerPhone match $shortPattern)] | order(submittedAt desc) {
              _id,
              playerName,
              playerPhone,
              drawId,
              luckyNumber,
              poolCapacity,
              amount,
              currency,
              paymentMethod,
              "proofScreenshotUrl": proofScreenshot.asset->url,
              status,
              adminNotes,
              submittedAt
            }`;

        const sanityEntries = await client.fetch<any[]>(sanityQuery, {
          phone,
          shortPattern: `*${shortPhone}`,
          drawId,
        });

        if (Array.isArray(sanityEntries)) {
          for (const item of sanityEntries) {
            entries.push({
              id: item._id,
              draw_id: item.drawId || "RDL-2026-08A",
              user_id: `usr_${cleanDigits}`,
              user_name: item.playerName,
              user_phone: item.playerPhone,
              number: item.luckyNumber,
              pool_capacity: item.poolCapacity,
              amount: item.amount || 100,
              currency: item.currency || "ETB",
              method: item.paymentMethod || "telebirr",
              proof_url: item.proofScreenshotUrl,
              status: item.status || "pending",
              admin_notes: item.adminNotes,
              created_at: item.submittedAt || new Date().toISOString(),
            });
          }
        }
      } catch (cmsErr: any) {
        console.warn("⚠️ Sanity playerEntry fetch warning:", cmsErr.message);
      }
    }

    // 2. Fetch from Go backend if authorization header is provided
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      try {
        const queryStr = drawId ? `?draw_id=${drawId}` : "";
        const backendRes = await fetch(`${backendUrl}/entries/mine${queryStr}`, {
          headers: { Authorization: authHeader },
        });
        if (backendRes.ok) {
          const backendEntries = await backendRes.json();
          if (Array.isArray(backendEntries)) {
            const existingIds = new Set(entries.map((e) => e.id));
            for (const bEntry of backendEntries) {
              if (!existingIds.has(bEntry.id)) {
                entries.push(bEntry);
              }
            }
          }
        }
      } catch {
        // Backend not reached
      }
    }

    return NextResponse.json(entries);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch entries" }, { status: 500 });
  }
}
