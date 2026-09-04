import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanity/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Validates file buffer magic bytes to ensure file is genuinely a JPEG, PNG, or WEBP image.
 */
function isValidImageMagicBytes(buffer: Buffer): { valid: boolean; detectedType?: string } {
  if (buffer.length < 12) return { valid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedType: "image/jpeg" };
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { valid: true, detectedType: "image/png" };
  }

  // WEBP: 'RIFF' .... 'WEBP'
  const riffHeader = buffer.subarray(0, 4).toString("ascii");
  const webpHeader = buffer.subarray(8, 12).toString("ascii");
  if (riffHeader === "RIFF" && webpHeader === "WEBP") {
    return { valid: true, detectedType: "image/webp" };
  }

  return { valid: false };
}

/**
 * Sanitizes input filename to prevent directory traversal and special character exploits.
 */
function sanitizeFilename(originalName: string, fallbackExt = "jpg"): string {
  const base = originalName.replace(/^.*[\\/]/, ""); // strip directory paths
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, "_"); // replace special characters
  const parts = clean.split(".");
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : fallbackExt;
  const name = parts.join("_") || "receipt";
  return `proof_${Date.now()}_${name.slice(0, 30)}.${ext}`;
}

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

    if (proofFile && typeof proofFile.arrayBuffer === "function" && proofFile.size > 0) {
      // 1. File Size Verification (Max 5 MB)
      if (proofFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds the 5 MB limit (${(proofFile.size / (1024 * 1024)).toFixed(1)} MB uploaded).` },
          { status: 400 }
        );
      }

      // 2. MIME Type Verification
      if (!ALLOWED_MIME_TYPES.includes(proofFile.type)) {
        return NextResponse.json(
          { error: "Invalid image format. Allowed formats: JPEG, PNG, WEBP." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await proofFile.arrayBuffer());

      // 3. Binary Magic Bytes Verification
      const { valid, detectedType } = isValidImageMagicBytes(buffer);
      if (!valid) {
        return NextResponse.json(
          { error: "Security check failed: Uploaded file is corrupted or not a valid image file." },
          { status: 400 }
        );
      }

      // 4. Filename Sanitization
      const safeFilename = sanitizeFilename(proofFile.name || "receipt.jpg");

      const writeClient = getSanityWriteClient();
      if (writeClient) {
        try {
          const asset = await writeClient.assets.upload("image", buffer, {
            filename: safeFilename,
            contentType: detectedType || proofFile.type || "image/jpeg",
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
    }

    const writeClient = getSanityWriteClient();
    if (writeClient) {
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
