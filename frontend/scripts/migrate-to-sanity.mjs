import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
console.log("🚀 Rimna Digital Lottery — Complete CMS Migration & Sync Tool");
console.log("══════════════════════════════════════════════════════════════════");
console.log(`📌 Project ID: ${projectId}`);
console.log(`📦 Dataset:    ${dataset}`);

if (!token) {
  console.warn("\n⚠️  SANITY_API_TOKEN is not configured in .env.local!");
  console.log("👉 How to get a write token:");
  console.log(`   1. Open: https://sanity.io/manage/project/${projectId}/api#tokens`);
  console.log("   2. Click '+ Add API token'");
  console.log("   3. Name it 'migration' and select 'Editor' (Write permissions)");
  console.log("   4. Copy the token and paste it into frontend/.env.local as:");
  console.log("      SANITY_API_TOKEN=sk...");
  console.log("   5. Re-run: npm run migrate:cms\n");
  console.log("ℹ️  Note: You can also edit and create tickets manually in your Studio at http://localhost:3000/studio\n");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const ALL_MIGRATION_DOCUMENTS = [
  // ── 1. Global Site Settings ──────────────────────────────────────────
  {
    "_id": "siteSettings",
    "_type": "siteSettings",
    "siteName": "Rimna Digital Lottery",
    "tagline": "Ethiopia & Diaspora's Premier Transparent Digital Lottery",
    "contactPhone": "+251 911 000 000",
    "supportEmail": "support@rimnalottery.com",
    "telegramUrl": "https://t.me/RimnaLotteryOfficial",
    "whatsappUrl": "https://wa.me/251911000000"
  },

  // ── 2. Top 3 Featured Jackpot Cards (Under Hero) ──────────────────────
  {
    "_id": "card-usd-250",
    "_type": "jackpotCard",
    "serial": "RDL-USD-250",
    "badgeTitle": "DIASPORA USD JACKPOT",
    "grandPrize": "$1,250,000",
    "currency": "USD",
    "ticketPrice": 250,
    "drawDate": "Friday 18th July",
    "poolLabels": ["1K", "3K", "5K"],
    "order": 1,
    "isActive": true
  },
  {
    "_id": "card-etb-200",
    "_type": "jackpotCard",
    "serial": "RDL-ETB-200",
    "badgeTitle": "200 BIRR HOLIDAY JACKPOT",
    "grandPrize": "1,000,000 ETB",
    "currency": "ETB",
    "ticketPrice": 200,
    "drawDate": "Friday 18th July",
    "poolLabels": ["1K", "3K", "5K"],
    "order": 2,
    "isActive": true
  },
  {
    "_id": "card-etb-100",
    "_type": "jackpotCard",
    "serial": "RDL-ETB-100",
    "badgeTitle": "100 BIRR CLASSIC MULTI-POOL",
    "grandPrize": "500,000 ETB",
    "currency": "ETB",
    "ticketPrice": 100,
    "drawDate": "Friday 18th July",
    "poolLabels": ["1K", "2K", "3K", "5K"],
    "order": 3,
    "isActive": true
  },

  // ── 3. Active & Scheduled Lottery Draws ──────────────────────────────
  {
    "_id": "draw-etb-100",
    "_type": "draw",
    "drawId": "RDL-2026-08A",
    "title": "100 Birr Classic Multi-Pool Draw",
    "titleAm": "የ 100 ብር ክላሲክ መልቲ-ፑል እጣ",
    "titleOm": "Badhaasa Qarshii 100",
    "slug": { "_type": "slug", "current": "100-birr-classic-multi-pool-draw" },
    "status": "open",
    "currency": "ETB",
    "ticketPrice": 100,
    "totalPrizeValue": "500,000 ETB",
    "deadline": "2026-09-02T18:00:00.000Z",
    "description": "Select your participant pool capacity (1K, 2K, 3K, 5K) and pick your lucky number. 10 guaranteed winners drawn live on video stream.",
    "prizes": [
      { "_key": "p1", "rank": 1, "label": "1st Prize · Jackpot", "prizeTitle": "160,000 ETB Cash", "valueAmount": "160,000 ETB" },
      { "_key": "p2", "rank": 2, "label": "2nd Prize", "prizeTitle": "80,000 ETB Cash", "valueAmount": "80,000 ETB" },
      { "_key": "p3", "rank": 3, "label": "3rd Prize", "prizeTitle": "50,000 ETB Cash", "valueAmount": "50,000 ETB" },
      { "_key": "p4", "rank": 4, "label": "4th–10th Prizes", "prizeTitle": "30,000 ETB Cash Each", "valueAmount": "210,000 ETB Total" }
    ]
  },
  {
    "_id": "draw-usd-250",
    "_type": "draw",
    "drawId": "RDL-USD-250",
    "title": "$250 Diamond Global Diaspora Draw",
    "titleAm": "የ $250 ዳያስፖራ ዳይመንድ እጣ",
    "titleOm": "Badhaasa Daayimondii $250",
    "slug": { "_type": "slug", "current": "250-diamond-global-diaspora-draw" },
    "status": "open",
    "currency": "USD",
    "ticketPrice": 250,
    "totalPrizeValue": "$1,250,000",
    "deadline": "2026-09-10T18:00:00.000Z",
    "description": "International diaspora flagship draw. 10 guaranteed winners with instant global wire and CBE remittances.",
    "prizes": [
      { "_key": "p1", "rank": 1, "label": "1st Prize · Grand Jackpot", "prizeTitle": "$400,000 Cash Wire", "valueAmount": "$400,000" },
      { "_key": "p2", "rank": 2, "label": "2nd Prize", "prizeTitle": "$200,000 Cash Wire", "valueAmount": "$200,000" },
      { "_key": "p3", "rank": 3, "label": "3rd Prize", "prizeTitle": "$125,000 Cash Wire", "valueAmount": "$125,000" }
    ]
  },
  {
    "_id": "draw-etb-200",
    "_type": "draw",
    "drawId": "RDL-2026-09B",
    "title": "200 Birr Grand Holiday Jackpot",
    "titleAm": "የ 200 ብር የበዓል ታላቅ ጃክፖት",
    "titleOm": "Badhaasa Guddaa Ayyaanaa Qarshii 200",
    "slug": { "_type": "slug", "current": "200-birr-grand-holiday-jackpot" },
    "status": "open",
    "currency": "ETB",
    "ticketPrice": 200,
    "totalPrizeValue": "1,000,000 ETB",
    "deadline": "2026-09-15T18:00:00.000Z",
    "description": "Holiday celebration jackpot with 1 Million ETB maximum prize pool and 10 guaranteed rank payouts."
  },
  {
    "_id": "draw-usd-50",
    "_type": "draw",
    "drawId": "RDL-USD-050",
    "title": "$50 Global Tier Jackpot",
    "titleAm": "የ $50 ግሎባል ጃክፖት",
    "titleOm": "Badhaasa Gloobaalaa $50",
    "slug": { "_type": "slug", "current": "50-global-tier-jackpot" },
    "status": "open",
    "currency": "USD",
    "ticketPrice": 50,
    "totalPrizeValue": "$250,000",
    "deadline": "2026-09-20T18:00:00.000Z",
    "description": "Affordable global diaspora lottery with capped participant pools and 10 audited winners."
  },
  {
    "_id": "draw-etb-50",
    "_type": "draw",
    "drawId": "RDL-2026-05A",
    "title": "50 Birr Starter Booster",
    "titleAm": "የ 50 ብር ስታርተር ቡስተር",
    "titleOm": "Badhaasa Qarshii 50",
    "slug": { "_type": "slug", "current": "50-birr-starter-booster" },
    "status": "open",
    "currency": "ETB",
    "ticketPrice": 50,
    "totalPrizeValue": "250,000 ETB",
    "deadline": "2026-09-22T18:00:00.000Z",
    "description": "Fast-paced community raffle with 10 guaranteed cash winners."
  },
  {
    "_id": "draw-usd-100",
    "_type": "draw",
    "drawId": "RDL-USD-100",
    "title": "$100 International Diaspora Raffle",
    "titleAm": "የ $100 ዳያስፖራ ራፍል",
    "titleOm": "Badhaasa $100",
    "slug": { "_type": "slug", "current": "100-international-diaspora-raffle" },
    "status": "open",
    "currency": "USD",
    "ticketPrice": 100,
    "totalPrizeValue": "$500,000",
    "deadline": "2026-09-25T18:00:00.000Z",
    "description": "Popular diaspora tier with balanced pool sizes and instant international remittance."
  },
  {
    "_id": "draw-etb-150",
    "_type": "draw",
    "drawId": "RDL-2026-06C",
    "title": "150 Birr Premier Jackpot Draw",
    "titleAm": "የ 150 ብር ፕሪሚየር ጃክፖት",
    "titleOm": "Badhaasa Qarshii 150",
    "slug": { "_type": "slug", "current": "150-birr-premier-jackpot-draw" },
    "status": "upcoming",
    "currency": "ETB",
    "ticketPrice": 150,
    "totalPrizeValue": "750,000 ETB",
    "deadline": "2026-10-01T18:00:00.000Z",
    "description": "Scheduled high-reward draw releasing after current round completion."
  },

  // ── 4. Official Results & Top 10 Audited Numbers ─────────────────────
  {
    "_id": "draw-result-latest",
    "_type": "drawResult",
    "drawId": "RDL-2026-07",
    "drawTitle": "100 Birr Classic Multi-Pool Draw",
    "drawDate": "2026-08-25",
    "broadcastVideoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "isPublished": true,
    "auditNotes": "Public broadcast live video draw verified. All 10 prize winners received instant payout via CBE and Telebirr within 30 minutes.",
    "winningNumbers": [
      { "_key": "w1", "rank": 1, "luckyNumber": "42", "prizeAmount": "60,000 ETB", "winnerName": "Dawit T.", "winnerLocation": "Addis Ababa", "payoutStatus": "paid_cbe" },
      { "_key": "w2", "rank": 2, "luckyNumber": "89", "prizeAmount": "40,000 ETB", "winnerName": "Sara M.", "winnerLocation": "Hawassa", "payoutStatus": "paid_telebirr" },
      { "_key": "w3", "rank": 3, "luckyNumber": "07", "prizeAmount": "30,000 ETB", "winnerName": "Yohannes B.", "winnerLocation": "Adama", "payoutStatus": "paid_cbe" },
      { "_key": "w4", "rank": 4, "luckyNumber": "15", "prizeAmount": "18,000 ETB", "winnerName": "Helen K.", "winnerLocation": "Bahir Dar", "payoutStatus": "paid_telebirr" },
      { "_key": "w5", "rank": 5, "luckyNumber": "63", "prizeAmount": "14,000 ETB", "winnerName": "Amanuel G.", "winnerLocation": "Mekelle", "payoutStatus": "paid_cbe" },
      { "_key": "w6", "rank": 6, "luckyNumber": "77", "prizeAmount": "10,000 ETB", "winnerName": "Kidus N.", "winnerLocation": "Dire Dawa", "payoutStatus": "paid_telebirr" },
      { "_key": "w7", "rank": 7, "luckyNumber": "21", "prizeAmount": "8,000 ETB", "winnerName": "Bethlehem T.", "winnerLocation": "Gondar", "payoutStatus": "paid_cbe" },
      { "_key": "w8", "rank": 8, "luckyNumber": "94", "prizeAmount": "7,000 ETB", "winnerName": "Abel W.", "winnerLocation": "Addis Ababa", "payoutStatus": "paid_telebirr" },
      { "_key": "w9", "rank": 9, "luckyNumber": "38", "prizeAmount": "7,000 ETB", "winnerName": "Tigist M.", "winnerLocation": "Jimma", "payoutStatus": "paid_cbe" },
      { "_key": "w10", "rank": 10, "luckyNumber": "50", "prizeAmount": "6,000 ETB", "winnerName": "Daniel S.", "winnerLocation": "Addis Ababa", "payoutStatus": "paid_telebirr" }
    ]
  },

  // ── 5. Multilingual Translations Dictionary ─────────────────────────
  {
    "_id": "trans-nav-draws",
    "_type": "translation",
    "key": "nav.draws",
    "category": "nav",
    "en": "Draws & Tickets",
    "am": "እጣዎች እና ትኬቶች",
    "om": "Carraawwan & Tikkeettii",
    "ti": "ዕጫታትን ቲኬታትን"
  },
  {
    "_id": "trans-nav-results",
    "_type": "translation",
    "key": "nav.results",
    "category": "nav",
    "en": "Results & Live Stream",
    "am": "ውጤቶች እና የቀጥታ ስርጭት",
    "om": "Bu'aawwan & Tamsaasa Kallattii",
    "ti": "ውጽኢታትን ቀጥታ ፈነወን"
  },
  {
    "_id": "trans-hero-headline",
    "_type": "translation",
    "key": "hero.headline",
    "category": "hero",
    "en": "Transparent Live Video Draws & Real Payouts",
    "am": "ግልጽ የቀጥታ የቪዲዮ እጣዎች እና ፈጣን ክፍያዎች",
    "om": "Tamsaasa Kallattii Qulqulluu & Kaffaltii Saffisaa",
    "ti": "ግልፂ ቀጥታ ናይ ቪድዮ ዕጫታትን ቅልጡፍ ክፍሊትን"
  }
];

async function runMigration() {
  console.log(`\n⏳ Migrating ${ALL_MIGRATION_DOCUMENTS.length} documents into Sanity CMS...`);
  let successCount = 0;

  for (const doc of ALL_MIGRATION_DOCUMENTS) {
    try {
      const res = await client.createOrReplace(doc);
      console.log(`✅ [${res._type}] ${res._id} synced successfully.`);
      successCount++;
    } catch (err) {
      console.error(`❌ Error syncing ${doc._id}:`, err.message);
    }
  }

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log(`🎉 Migration complete! ${successCount}/${ALL_MIGRATION_DOCUMENTS.length} documents prewritten to CMS.`);
  console.log("👉 Open your Studio at: http://localhost:3000/studio");
  console.log("   You can now edit, delete, or add any ticket, card, or text directly!");
  console.log("══════════════════════════════════════════════════════════════════\n");
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
