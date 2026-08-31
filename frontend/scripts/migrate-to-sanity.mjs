import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ALL_INITIAL_DOCUMENTS } from "../sanity/data/initialContent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local
const envPath = resolve(__dirname, "../.env.local");
let envVars = {};
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      envVars[key] = val;
    }
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || envVars.NEXT_PUBLIC_SANITY_PROJECT_ID || "ocm4sz73";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || envVars.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN || envVars.SANITY_API_TOKEN;

console.log("══════════════════════════════════════════════════════════════════");
console.log("🚀 Rimna Digital Lottery — Complete CMS Migration Tool");
console.log("══════════════════════════════════════════════════════════════════");
console.log(`📌 Project ID: ${projectId}`);
console.log(`📦 Dataset:    ${dataset}`);

if (!token) {
  console.warn("\n⚠️  SANITY_API_TOKEN is not configured in .env.local!");
  console.log("👉 You have TWO ways to migrate your content:");
  console.log("   1. In the Browser: Open http://localhost:3000/studio and click the '⚡ Content Sync' tab at the top.");
  console.log("   2. Via Terminal: Add SANITY_API_TOKEN=sk... to frontend/.env.local and rerun this script.\n");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function runMigration() {
  console.log(`\n⏳ Migrating ${ALL_INITIAL_DOCUMENTS.length} documents into Sanity CMS...`);
  let successCount = 0;

  for (const doc of ALL_INITIAL_DOCUMENTS) {
    try {
      const res = await client.createOrReplace(doc);
      console.log(`✅ [${res._type}] ${res._id} synced successfully.`);
      successCount++;
    } catch (err) {
      console.error(`❌ Error syncing ${doc._id}:`, err.message);
    }
  }

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log(`🎉 Migration complete! ${successCount}/${ALL_INITIAL_DOCUMENTS.length} documents synced to CMS.`);
  console.log("👉 Open your Studio at: http://localhost:3000/studio");
  console.log("══════════════════════════════════════════════════════════════════\n");
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
