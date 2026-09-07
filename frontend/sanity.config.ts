import { defineConfig, type Tool } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes";
import { ScreenshotManagerTool } from "./sanity/tools/ScreenshotManagerTool";
import { MigrationTool } from "./sanity/tools/MigrationTool";
import { BackupView } from "./sanity/components/BackupView";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const screenshotManagerTool: Tool = {
  name: "screenshot-manager",
  title: "Storage & Screenshots",
  icon: () => "📸",
  component: ScreenshotManagerTool,
};

const contentSyncTool: Tool = {
  name: "content-sync",
  title: "⚡ Content & Language Sync",
  icon: () => "🔄",
  component: MigrationTool,
};

export default defineConfig({
  basePath: "/studio",
  name: "rimna_lottery_cms",
  title: "Rimna Digital Lottery Studio",
  projectId,
  dataset,
  // Tab order: 1. Structure -> 2. Storage & Screenshots -> 3. Content & Language Sync -> 4. Vision
  tools: (prev) => {
    const structure = prev.find((t) => t.name === "structure");
    const vision = prev.find((t) => t.name === "vision");
    const others = prev.filter((t) => t.name !== "structure" && t.name !== "vision");
    return [
      ...(structure ? [structure] : []),
      screenshotManagerTool,
      contentSyncTool,
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
                    S.listItem()
                      .title("🧭 Navigation & Header")
                      .child(
                        S.documentList()
                          .title("Navigation & Header")
                          .filter('_type == "uiTranslation" && category == "nav"')
                      ),
                    S.listItem()
                      .title("🌟 Hero & Live Countdown")
                      .child(
                        S.documentList()
                          .title("Hero & Live Countdown")
                          .filter('_type == "uiTranslation" && category == "hero"')
                      ),
                    S.listItem()
                      .title("🎟️ Ticket Configurator & Purchase")
                      .child(
                        S.documentList()
                          .title("Ticket Configurator & Purchase")
                          .filter('_type == "uiTranslation" && category == "ticket"')
                      ),
                    S.listItem()
                      .title("🎰 Draws & Catalog Explorer")
                      .child(
                        S.documentList()
                          .title("Draws & Catalog Explorer")
                          .filter('_type == "uiTranslation" && category == "draws"')
                      ),
                    S.listItem()
                      .title("🛡️ Fairness & Transparency")
                      .child(
                        S.documentList()
                          .title("Fairness & Transparency")
                          .filter('_type == "uiTranslation" && category == "fairness"')
                      ),
                    S.listItem()
                      .title("🏆 Winners & Payouts Feed")
                      .child(
                        S.documentList()
                          .title("Winners & Payouts Feed")
                          .filter('_type == "uiTranslation" && category == "winners"')
                      ),
                    S.listItem()
                      .title("❓ FAQs & Guides")
                      .child(
                        S.documentList()
                          .title("FAQs & Guides")
                          .filter('_type == "uiTranslation" && category == "faq"')
                      ),
                    S.listItem()
                      .title("💬 Testimonials & Community")
                      .child(
                        S.documentList()
                          .title("Testimonials & Community")
                          .filter('_type == "uiTranslation" && category == "testimonials"')
                      ),
                    S.listItem()
                      .title("📌 Footer & Legal")
                      .child(
                        S.documentList()
                          .title("Footer & Legal")
                          .filter('_type == "uiTranslation" && category == "footer"')
                      ),
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

            // 9. Sync Tool in Desk
            S.listItem()
              .title("⚡ Sync All Content & Translations to CMS")
              .child(
                S.component(MigrationTool)
                  .title("⚡ Sync All Content & Translations")
              ),

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
  schema,
});


