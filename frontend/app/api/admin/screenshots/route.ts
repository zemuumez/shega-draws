import { NextResponse } from "next/server";
import { sanityClient, getSanityWriteClient } from "@/lib/sanity/client";

export interface ScreenshotEntrySummary {
  _id: string;
  playerName: string;
  playerPhone: string;
  drawId?: string;
  luckyNumber?: string;
  poolCapacity?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  submittedAt?: string;
  status?: "pending" | "confirmed" | "rejected";
  assetId?: string;
  imageUrl?: string;
  assetSize?: number; // bytes
  mimeType?: string;
  originalFilename?: string;
}

/**
 * GET /api/admin/screenshots
 * Query params:
 *  - drawId: string
 *  - poolCapacity: string
 *  - amount: number
 *  - currency: string
 *  - status: pending | confirmed | rejected
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const drawId = searchParams.get("drawId");
    const poolCapacity = searchParams.get("poolCapacity");
    const amount = searchParams.get("amount") ? Number(searchParams.get("amount")) : null;
    const currency = searchParams.get("currency");
    const status = searchParams.get("status");

    // Build GROQ query filters
    const filters = [`_type == "playerEntry"`];
    const params: Record<string, any> = {};

    if (drawId && drawId !== "all") {
      filters.push(`drawId == $drawId`);
      params.drawId = drawId;
    }
    if (poolCapacity && poolCapacity !== "all") {
      filters.push(`poolCapacity == $poolCapacity`);
      params.poolCapacity = poolCapacity;
    }
    if (amount !== null && !isNaN(amount)) {
      filters.push(`amount == $amount`);
      params.amount = amount;
    }
    if (currency && currency !== "all") {
      filters.push(`currency == $currency`);
      params.currency = currency;
    }
    if (status && status !== "all") {
      filters.push(`status == $status`);
      params.status = status;
    }

    const query = `*[${filters.join(" && ")}] | order(submittedAt desc) {
      _id,
      playerName,
      playerPhone,
      drawId,
      luckyNumber,
      poolCapacity,
      amount,
      currency,
      paymentMethod,
      submittedAt,
      status,
      "assetId": proofScreenshot.asset->_id,
      "imageUrl": proofScreenshot.asset->url,
      "assetSize": proofScreenshot.asset->size,
      "mimeType": proofScreenshot.asset->mimeType,
      "originalFilename": proofScreenshot.asset->originalFilename
    }`;

    const entries: ScreenshotEntrySummary[] = await sanityClient.fetch(query, params);

    // Also fetch list of all unique draws, pool sizes, and currencies for filter dropdowns
    const statsQuery = `{
      "draws": array::unique(*[_type == "playerEntry" && defined(drawId)].drawId),
      "poolSizes": array::unique(*[_type == "playerEntry" && defined(poolCapacity)].poolCapacity),
      "prices": array::unique(*[_type == "playerEntry" && defined(amount)].amount),
      "totalStorageBytes": math::sum(*[_type == "playerEntry" && defined(proofScreenshot.asset)].proofScreenshot.asset->size)
    }`;

    const stats = await sanityClient.fetch(statsQuery).catch(() => ({
      draws: [],
      poolSizes: [],
      prices: [],
      totalStorageBytes: 0,
    }));

    return NextResponse.json({
      success: true,
      count: entries.length,
      entries,
      stats,
    });
  } catch (err: any) {
    console.error("❌ Error fetching screenshots:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to fetch screenshots" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/screenshots
 * Body payload:
 * {
 *   ids?: string[],                 // specific playerEntry document IDs to delete
 *   drawId?: string,                // delete all screenshots for this draw ID
 *   poolCapacity?: string,          // delete all screenshots for this pool
 *   amount?: number,                // delete all screenshots of a specific price tier
 *   currency?: string,              // delete by currency
 *   status?: string,                // delete by status (e.g. rejected)
 *   deleteAssets?: boolean          // whether to permanently delete the underlying image assets (defaults to true)
 * }
 */
export async function DELETE(request: Request) {
  try {
    const writeClient = getSanityWriteClient();
    if (!writeClient) {
      return NextResponse.json(
        { error: "Sanity write client unavailable. Check SANITY_API_TOKEN in .env.local." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      ids,
      drawId,
      poolCapacity,
      amount,
      currency,
      status,
      deleteAssets = true,
    } = body;

    // Build target documents query
    const filters = [`_type == "playerEntry"`];
    const params: Record<string, any> = {};

    if (Array.isArray(ids) && ids.length > 0) {
      filters.push(`_id in $ids`);
      params.ids = ids;
    } else {
      if (drawId && drawId !== "all") {
        filters.push(`drawId == $drawId`);
        params.drawId = drawId;
      }
      if (poolCapacity && poolCapacity !== "all") {
        filters.push(`poolCapacity == $poolCapacity`);
        params.poolCapacity = poolCapacity;
      }
      if (amount !== undefined && amount !== null && amount !== "all") {
        filters.push(`amount == $amount`);
        params.amount = Number(amount);
      }
      if (currency && currency !== "all") {
        filters.push(`currency == $currency`);
        params.currency = currency;
      }
      if (status && status !== "all") {
        filters.push(`status == $status`);
        params.status = status;
      }
    }

    // Must have at least one filter criterion so we don't accidentally wipe without intent
    if (filters.length === 1 && (!ids || ids.length === 0)) {
      return NextResponse.json(
        { error: "Please specify at least one filter criteria (e.g. drawId, poolCapacity, amount, or document IDs) to delete." },
        { status: 400 }
      );
    }

    // 1. Fetch matching entries to collect their image asset IDs before deleting the docs
    const targetQuery = `*[${filters.join(" && ")}] {
      _id,
      "assetId": proofScreenshot.asset->_id
    }`;

    const targetDocs: Array<{ _id: string; assetId?: string }> = await sanityClient.fetch(targetQuery, params);

    if (targetDocs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No matching player entries found to delete.",
        deletedDocumentsCount: 0,
        deletedAssetsCount: 0,
      });
    }

    const docIds = targetDocs.map((d) => d._id);
    const assetIds = targetDocs.map((d) => d.assetId).filter(Boolean) as string[];

    // 2. Delete the playerEntry documents in Sanity
    let deletedDocsCount = 0;
    const docTx = writeClient.transaction();
    for (const docId of docIds) {
      docTx.delete(docId);
    }
    await docTx.commit();
    deletedDocsCount = docIds.length;

    // 3. Permanently delete underlying Sanity image assets to reclaim cloud storage space
    let deletedAssetsCount = 0;
    if (deleteAssets && assetIds.length > 0) {
      for (const assetId of assetIds) {
        try {
          await writeClient.delete(assetId);
          deletedAssetsCount++;
        } catch (assetErr: any) {
          // If asset is referenced by another document, log warning and continue
          console.warn(`Could not delete asset ${assetId}:`, assetErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedDocsCount} player entries and purged ${deletedAssetsCount} screenshot assets to reclaim server storage.`,
      deletedDocumentsCount: deletedDocsCount,
      deletedAssetsCount: deletedAssetsCount,
    });
  } catch (err: any) {
    console.error("❌ Bulk delete error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to perform bulk deletion" },
      { status: 500 }
    );
  }
}
