import { defineConfig, type Tool } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes";
import { MigrationTool } from "./sanity/tools/MigrationTool";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ocm4sz73";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const contentSyncTool: Tool = {
  name: "content-sync",
  title: "⚡ Content Sync",
  icon: () => "🚀",
  component: MigrationTool,
};

export default defineConfig({
  basePath: "/studio",
  name: "rimna_lottery_cms",
  title: "Rimna Digital Lottery Studio",
  projectId,
  dataset,
  tools: (prev) => [contentSyncTool, ...prev],
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Rimna CMS Management")
          .items([
            // 1. Primary: Submitted Ticket Receipts & Payment Proofs
            S.documentTypeListItem("playerEntry")
              .title("📸 Submitted Ticket Receipts & Proofs"),

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

            // 5. Winner Testimonials
            S.documentTypeListItem("testimonial")
              .title("💬 Winner Testimonials"),

            // 6. Player Contact Messages
            S.documentTypeListItem("contactMessage")
              .title("✉️ Player Contact Messages"),
          ]),
    }),
    visionTool(),
  ],
  schema,
});
