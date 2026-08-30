import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanity/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const playerName = (formData.get("name") as string) || "Anonymous Player";
    const playerPhone = (formData.get("phone") as string) || "";
    const drawId = (formData.get("draw_id") as string) || "RDL-2026-08A";
    const luckyNumber = (formData.get("number") as string) || "";
    const poolCapacity = (formData.get("pool_capacity") as string) || "1,000 (1K)";
    const amount = Number(formData.get("amount") || 100);
    const currency = (formData.get("currency") as string) || "ETB";
    const paymentMethod = (formData.get("method") as string) || "telebirr";
    const proofFile = formData.get("proof") as File | null;

    let imageAssetRef = undefined;

    const writeClient = getSanityWriteClient();
    if (!writeClient) {
      console.warn("⚠️  [CMS Upload] SANITY_API_TOKEN is not set in .env.local. Add your Sanity Write Token to automatically view uploaded screenshots in Sanity Studio (/studio).");
    } else {
      if (proofFile && typeof proofFile.arrayBuffer === "function") {
        try {
          const buffer = Buffer.from(await proofFile.arrayBuffer());
          const asset = await writeClient.assets.upload("image", buffer, {
            filename: proofFile.name || "payment_proof.jpg",
            contentType: proofFile.type || "image/jpeg",
          });
          imageAssetRef = {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: asset._id,
            },
          };
        } catch (assetErr: any) {
          console.error("❌ Screenshot upload error to Sanity:", assetErr.message);
        }
      }

      try {
        const createdDoc = await writeClient.create({
          _type: "playerEntry",
          playerName,
          playerPhone,
          drawId,
          luckyNumber,
          poolCapacity,
          amount,
          currency,
          paymentMethod,
          proofScreenshot: imageAssetRef,
          submittedAt: new Date().toISOString(),
          status: "pending",
        });
        console.log(`✅ [CMS Upload] Ticket entry & screenshot created in Sanity: ${createdDoc._id}`);
      } catch (docErr: any) {
        console.error("❌ playerEntry creation error in Sanity:", docErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Ticket entry & payment screenshot received for admin review.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit entry" }, { status: 500 });
  }
}
