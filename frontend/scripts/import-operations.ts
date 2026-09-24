/** Offline, repeatable import. No writes to Sanity; dry-run unless --apply. */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { Pool } from "pg";
import { readBackup } from "../lib/backup/cms";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
const operational = new Set([
  "playerEntry",
  "draw",
  "drawResult",
  "advertiser",
  "contactMessage",
]);
const hash = (s: string | Buffer | Uint8Array) =>
  createHash("sha256").update(s).digest("hex");
const capacity = (n: unknown) =>
  Number(
    String(n)
      .replace(/,/g, "")
      .match(/^\s*(\d+)/)?.[1] || 0,
  );
const selection = (currency: string, price: number, pool: number) =>
  `${currency}:${price}:${pool}`;
async function main() {
  const file = process.argv.find((a) => /\.(zip|json)$/i.test(a));
  if (!file)
    throw new Error("Pass a complete CMS ZIP backup (or JSON without media).");
  const buffer = await readFile(file);
  const prepared = await readBackup(
    Uint8Array.from(buffer).buffer,
    /\.zip$/i.test(file),
  );
  const published = prepared.backup.documents.filter(
    (d) => !d._id.startsWith("drafts."),
  );
  const docs = published.filter((d) => operational.has(d._type));
  console.log(
    JSON.stringify({
      documents: docs.length,
      receipts: docs.filter((d) => d._type === "playerEntry").length,
      mediaFiles: prepared.files.size,
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
    }),
  );
  const assets = new Map(prepared.backup.assets.map((a) => [a.id, a]));
  const receiptMedia = new Map<
    string,
    { key: string; mime: string; bytes: Uint8Array }
  >();
  for (const d of docs.filter((d) => d._type === "playerEntry")) {
    const ref = d.proofScreenshot?.asset?._ref;
    if (!ref) continue;
    const asset = assets.get(ref);
    const bytes = asset && prepared.files.get(asset.id);
    if (!bytes)
      throw new Error(
        `Receipt ${d._id} needs its original media; import a full ZIP.`,
      );
    receiptMedia.set(d._id, { key: hash(bytes), mime: asset.mimeType, bytes });
  }
  if (!process.argv.includes("--apply")) return;
  if (!process.env.DATABASE_URL)
    throw new Error("Set DATABASE_URL for the destination backend.");
  const db = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const c = await db.connect();
  const mediaDir = resolve(process.env.MEDIA_DIR || "../backend/private-media");
  try {
    await mkdir(mediaDir, { recursive: true, mode: 0o700 });
    for (const m of receiptMedia.values())
      await writeFile(resolve(mediaDir, m.key), m.bytes, { mode: 0o600 });
    await c.query("BEGIN");
    await c.query("SELECT pg_advisory_xact_lock(701241)");
    const draws = new Map<string, string>(),
      selections = new Map<string, string>();
    async function ensureDraw(
      id: string,
      title: string,
      currency: string,
      price: number,
      pool: number,
      deadline?: string,
    ) {
      if (
        !["ETB", "USD"].includes(currency) ||
        !Number.isInteger(pool) ||
        pool < 1 ||
        pool > 100000 ||
        !Number.isFinite(price) ||
        price <= 0 ||
        price > 1000000
      )
        throw new Error(`Invalid legacy draw: ${id}`);
      await c.query(
        `INSERT INTO draws(id,title,currency,price_minor,capacity,status,deadline) VALUES($1,$2,$3,$4,$5,'closed',$6) ON CONFLICT(id) DO NOTHING`,
        [
          id,
          title,
          currency,
          Math.round(price * 100),
          pool,
          deadline || "2099-01-01",
        ],
      );
    }
    for (const d of docs.filter((d) => d._type === "draw")) {
      await ensureDraw(
        d._id,
        d.title || d.drawId,
        d.currency,
        Number(d.ticketPrice),
        capacity(d.poolCapacity),
        d.deadline,
      );
      draws.set(d.drawId, d._id);
      draws.set(d._id, d._id);
    }
    // Preserve the old price/pool combinations as CLOSED selections, never auto-open sales.
    const settings = published
      .filter((d) => d._type === "siteSettings")
      .sort((a, b) =>
        String(b._updatedAt).localeCompare(String(a._updatedAt)),
      )[0];
    for (const currency of ["ETB", "USD"])
      for (const price of settings?.[
        currency === "ETB" ? "etbPrices" : "usdPrices"
      ] || [])
        for (const pool of settings?.poolSizes || []) {
          const p = Number(price.value),
            n = capacity(pool.size),
            key = selection(currency, p, n),
            id = "legacy-selection-" + hash(key).slice(0, 24);
          await ensureDraw(id, key, currency, p, n);
          selections.set(key, id);
        }
    for (const d of docs) {
      const media = receiptMedia.get(d._id);
      const data = {
        ...d,
        ...(media ? { mediaKey: media.key, mediaMime: media.mime } : {}),
      };
      const inserted = await c.query(
        "INSERT INTO legacy_records(id,type,data) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING RETURNING id",
        [d._id, d._type, data],
      );
      if (!inserted.rowCount) continue;
      if (d._type === "playerEntry") {
        const price = Number(d.amount),
          pool = capacity(d.poolCapacity),
          key = selection(d.currency, price, pool);
        let drawId =
          draws.get(d.drawDocumentId) ||
          draws.get(d.drawId) ||
          selections.get(key);
        if (!drawId) {
          drawId = "legacy-selection-" + hash(key).slice(0, 24);
          await ensureDraw(
            drawId,
            d.selectionKey || d.drawId || key,
            d.currency,
            price,
            pool,
          );
          selections.set(key, drawId);
        }
        const number = Number(d.luckyNumber);
        if (!Number.isInteger(number) || number < 1 || number > pool)
          throw new Error(`Invalid number in ${d._id}`);
        const target = (
          await c.query(
            "SELECT currency,price_minor,capacity FROM draws WHERE id=$1",
            [drawId],
          )
        ).rows[0];
        if (
          target.currency !== d.currency ||
          Number(target.price_minor) !== Math.round(price * 100) ||
          target.capacity !== pool
        )
          throw new Error(`Receipt ${d._id} does not match its draw.`);
        const status =
          d.status === "confirmed"
            ? "paid"
            : d.status === "rejected"
              ? "failed"
              : "legacy_pending";
        await c.query(
          `INSERT INTO orders(id,user_id,draw_id,number,amount_minor,currency,provider,status,idempotency_key,fingerprint,phone,email,name,promo_code,expires_at,created_at) VALUES($1,$2,$3,$4,$5,$6,'legacy',$7,$1,$1,$8,'',$9,$10,'2099-01-01',$11)`,
          [
            d._id,
            `unclaimed:${d._id}`,
            drawId,
            number,
            Math.round(price * 100),
            d.currency,
            status,
            d.playerPhone || "",
            d.playerName || "",
            d.promoCode || "",
            d.submittedAt || new Date().toISOString(),
          ],
        );
      } else if (d._type === "advertiser") {
        await c.query(
          "INSERT INTO advertisers(code,name,active,details) VALUES($1,$2,$3,$4) ON CONFLICT(code) DO NOTHING",
          [d.promoCode, d.name || d._id, d.status === "active", d],
        );
      } else if (d._type === "contactMessage") {
        await c.query(
          `INSERT INTO messages(id,kind,data,status) VALUES($1,'contact',$2,$3) ON CONFLICT(id) DO NOTHING`,
          [d._id, d, d.status === "resolved" ? "resolved" : "unread"],
        );
      }
    }
    let archivedResults = 0;
    for (const d of docs.filter((d) => d._type === "drawResult")) {
      const drawId = draws.get(d.drawId);
      if (!drawId) {
        archivedResults++;
        continue;
      }
      await c.query(
        "INSERT INTO results(draw_id,data) VALUES($1,$2) ON CONFLICT(draw_id) DO NOTHING",
        [drawId, { ...d, drawId }],
      );
      await c.query(`UPDATE draws SET status='completed' WHERE id=$1`, [
        drawId,
      ]);
    }
    await c.query(
      `INSERT INTO audit_log(actor,action,resource) VALUES('operator','legacy.import',$1)`,
      [hash(buffer)],
    );
    await c.query("COMMIT");
    console.log(
      `Imported. Draws remain closed/completed until reviewed; guest tickets remain unclaimed. ${archivedResults} results without a matching draw are retained in Imported receipts for manual review.`,
    );
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
    await db.end();
  }
}
main().catch((e) => {
  console.error((e as Error).message);
  process.exitCode = 1;
});
