import { defineConfig, type Tool } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes";
import { ScreenshotManagerTool } from "./sanity/tools/ScreenshotManagerTool";
import { translationCatalog } from "./lib/i18n/catalog";
import { BackupView } from "./sanity/components/BackupView";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const screenshotManagerTool: Tool = {
  name: "screenshot-manager",
  title: "Players & Exports",
  icon: () => "📸",
  component: ScreenshotManagerTool,
};

export default defineConfig({
  basePath: "/studio",
  name: "rimna_lottery_cms",
  title: "Rimna Digital Lottery Studio",
  projectId,
  dataset,
  // Structure, receipt exports and query tools.
  tools: (prev) => {
    const structure = prev.find((t) => t.name === "structure");
    const vision = prev.find((t) => t.name === "vision");
    const others = prev.filter((t) => t.name !== "structure" && t.name !== "vision");
    return [
      ...(structure ? [structure] : []),
      screenshotManagerTool,
      ...(vision ? [vision] : []),
      ...others,
    ];
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Rimna CMS Management")
          .items([
            // 1. Primary: Submitted Ticket Receipts & Payment Proofs with filters
            S.listItem()
              .title("📸 Submitted Ticket Receipts & Proofs")
              .child(
                S.list()
                  .title("Receipts Filter")
                  .items([
                    S.listItem()
                      .title("📋 All Submitted Receipts")
                      .child(S.documentTypeList("playerEntry").title("All Receipts")),
                    S.listItem()
                      .title("🟡 Pending Verification")
                      .child(
                        S.documentList()
                          .title("🟡 Pending Verification")
                          .filter('_type == "playerEntry" && (status == "pending" || !defined(status))')
                      ),
                    S.listItem()
                      .title("🟢 Confirmed & Approved")
                      .child(
                        S.documentList()
                          .title("🟢 Confirmed & Approved")
                          .filter('_type == "playerEntry" && status == "confirmed"')
                      ),
                    S.listItem()
                      .title("🔴 Rejected Proofs")
                      .child(
                        S.documentList()
                          .title("🔴 Rejected Proofs")
                          .filter('_type == "playerEntry" && status == "rejected"')
                      ),
                  ])
              ),

            S.divider(),

            // 2. Active Draws & Countdown Settings
            S.documentTypeListItem("draw")
              .title("🎰 Active Draws & Live Countdown"),

            // 3. Recorded 10 Live Draw Winners
            S.documentTypeListItem("drawResult")
              .title("🏆 Draw Results & 10 Winners"),

            S.divider(),

            // 4. Site Configuration, Language & Official Accounts
            S.listItem()
              .title("⚙️ Site Settings & Language Defaults")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),

            // 5. Website UI Translations (English, Amharic, Tigrinya)
            S.listItem()
              .title("🌐 Website UI Translations (EN / አማ / ትግ)")
              .child(
                S.list()
                  .title("UI Translations by Category")
                  .items([
                    S.listItem()
                      .title("📋 All UI Translation Keys")
                      .child(S.documentTypeList("uiTranslation").title("All UI Translations")),
                    ...[
                      ["nav", "🧭 Navigation & Header"], ["hero", "🌟 Hero & Countdown"],
                      ["ticket", "🎟️ Tickets, Checkout & Interface"], ["draws", "🎰 Draws & Results"],
                      ["fairness", "🛡️ Fairness"], ["winners", "🏆 Winners"], ["faq", "❓ FAQs & Guides"],
                      ["testimonials", "💬 Testimonials"], ["payments", "💳 Payments"], ["footer", "📌 Footer"], ["general", "⚙️ Other Website Text"],
                    ].map(([category, title]) => S.listItem().id(category).title(title).child(
                      S.list().title(title).items(translationCatalog.filter(entry => entry.category === category).map(entry =>
                        S.listItem().id(entry._id).title(entry.key).child(S.document().schemaType("uiTranslation").documentId(entry._id).initialValueTemplate("website-translation", {key:entry.key}))
                      ))
                    )),
                  ])
              ),

            // 6. Promotional Ads & Featured Prizes
            S.documentTypeListItem("advertisement")
              .title("📢 Promotional Ads & Featured Prizes"),

            // 7. Winner Testimonials
            S.documentTypeListItem("testimonial")
              .title("💬 Winner Testimonials"),

            // 8. Player Contact Messages
            S.documentTypeListItem("contactMessage")
              .title("✉️ Player Contact Messages"),

            S.divider(),

            // 10. Complete CMS Backup & Data Export
            S.listItem()
              .title("💾 CMS Complete Backup & Export")
              .child(
                S.component(BackupView)
                  .title("💾 CMS Complete Backup & Export")
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    ...schema,
    templates: (prev) => [...prev, {
      id: "website-translation", title: "Website translation", schemaType: "uiTranslation",
      parameters: [{name:"key", type:"string"}],
      value: ({key}: {key:string}) => {
        const entry = translationCatalog.find(item => item.key === key);
        return entry ? {key:entry.key, category:entry.category, en:entry.en, am:entry.am, ti:entry.ti} : {key};
      },
    }],
  },
});


