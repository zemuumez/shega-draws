import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local if present
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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || envVars.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || envVars.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN || envVars.SANITY_API_TOKEN;
const isClearMode = process.argv.includes("--clear") || process.argv.includes("-c");

console.log("🎟️  Shega Draws — Sanity CMS Seed & Reset Utility");
console.log(`📌 Project ID: ${projectId ?? "Not configured"}`);
console.log(`📦 Dataset:    ${dataset}`);
console.log(`⚙️  Mode:       ${isClearMode ? "🧹 CLEAR / DELETE TEMPORARY DOCUMENTS" : "🚀 IMPORT / SYNC SEED DOCUMENTS"}`);

if (!projectId || projectId === "your-project-id-here") {
  console.error("❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not configured in .env.local");
  console.log("👉 Please create a project at https://sanity.io and set your Project ID first.");
  process.exit(1);
}

if (!token) {
  console.warn("\n⚠️  SANITY_API_TOKEN not found in environment or .env.local.");
  console.log("👉 You can generate an Editor or Write Token at https://sanity.io/manage/project/" + projectId + "/api#tokens");
  console.log("👉 Add SANITY_API_TOKEN=your_token_here to .env.local to run automated imports or clears.");
  console.log("👉 Note: In the meantime, you can also edit/create documents manually in the Studio at http://localhost:3000/studio\n");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function main() {
  const seedFile = resolve(__dirname, "seed-sanity.json");
  const rawData = readFileSync(seedFile, "utf-8");
  const documents = JSON.parse(rawData);

  if (isClearMode) {
    console.log(`\n🧹 Clearing ${documents.length} temporary seed documents from Sanity CMS...`);
    for (const doc of documents) {
      try {
        await client.delete(doc._id);
        console.log(`🗑️  Deleted: [${doc._type}] ${doc._id}`);
      } catch (err) {
        console.warn(`ℹ️  Could not delete ${doc._id}: ${err.message}`);
      }
    }
    console.log("\n✨ Temporary CMS contents successfully cleared!");
    return;
  }

  console.log(`\n🚀 Uploading ${documents.length} seed documents...`);
  for (const doc of documents) {
    try {
      const res = await client.createOrReplace(doc);
      console.log(`✅ [${res._type}] ${res._id} imported successfully.`);
    } catch (err) {
      console.error(`❌ Failed to import ${doc._id}:`, err.message);
    }
  }

  console.log("\n🎉 CMS seed completed successfully! Check your Studio at http://localhost:3000/studio");
}

main().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
