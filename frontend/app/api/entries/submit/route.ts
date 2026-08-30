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
    if (writeClient && proofFile && typeof proofFile.arrayBuffer === "function") {
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
      } catch (assetErr) {
        console.warn("Screenshot upload warning:", assetErr);
      }
    }

    if (writeClient) {
      try {
        await writeClient.create({
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
      } catch (docErr) {
        console.warn("playerEntry doc creation warning:", docErr);
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
