import { defineConfig, type Tool } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes";
import { ScreenshotManagerTool } from "./sanity/tools/ScreenshotManagerTool";
import { BackupView } from "./sanity/components/BackupView";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ocm4sz73";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const screenshotManagerTool: Tool = {
  name: "screenshot-manager",
  title: "Storage & Screenshots",
  icon: () => "📸",
  component: ScreenshotManagerTool,
};

export default defineConfig({
  basePath: "/studio",
  name: "rimna_lottery_cms",
  title: "Rimna Digital Lottery Studio",
  projectId,
  dataset,
  // Tab order: 1. Structure -> 2. Storage & Screenshots -> 3. Vision
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

            // 4. Site Configuration & Payment Accounts
            S.listItem()
              .title("⚙️ Site Settings & Official Accounts")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),

            // 5. Promotional Ads & Featured Prizes
            S.documentTypeListItem("advertisement")
              .title("📢 Promotional Ads & Featured Prizes"),

            // 6. Winner Testimonials
            S.documentTypeListItem("testimonial")
              .title("💬 Winner Testimonials"),

            // 7. Player Contact Messages
            S.documentTypeListItem("contactMessage")
              .title("✉️ Player Contact Messages"),

            S.divider(),

            // 8. Complete CMS Backup & Data Export
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

