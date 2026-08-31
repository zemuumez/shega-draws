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
  title: "Rimna Digital Lottery CMS Studio",
  projectId,
  dataset,
  tools: (prev) => [contentSyncTool, ...prev],
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Rimna Digital Lottery CMS")
          .items([
            // ══════════════════════════════════════════════════════════
            // 1. Homepage Management
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("🏠 Homepage Management")
              .child(
                S.list()
                  .title("Homepage Content & Cards")
                  .items([
                    S.listItem()
                      .title("🌟 Hero Banner Section")
                      .child(
                        S.document()
                          .schemaType("heroContent")
                          .documentId("heroContent")
                      ),
                    S.documentTypeListItem("jackpotCard").title("🎫 3 Featured Hero Jackpot Cards"),
                    S.documentTypeListItem("testimonial").title("⭐ Customer Testimonials & Reviews"),
                    S.documentTypeListItem("promotion").title("📢 Special Events & Deals"),
                  ])
              ),

            // ══════════════════════════════════════════════════════════
            // 2. Page Sections Content
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("📄 Page Sections & Text Content")
              .child(
                S.list()
                  .title("Section Content")
                  .items([
                    S.listItem()
                      .title("💡 Why Rimna Lottery Section")
                      .child(
                        S.document()
                          .schemaType("sectionContent")
                          .documentId("section-why-rimna")
                      ),
                    S.listItem()
                      .title("📺 Live Video Broadcast Banner")
                      .child(
                        S.document()
                          .schemaType("sectionContent")
                          .documentId("section-live-broadcast")
                      ),
                    S.listItem()
                      .title("📝 How It Works (3 Steps)")
                      .child(
                        S.document()
                          .schemaType("sectionContent")
                          .documentId("section-how-it-works")
                      ),
                    S.listItem()
                      .title("🔐 Cryptographic Fairness Section")
                      .child(
                        S.document()
                          .schemaType("sectionContent")
                          .documentId("section-fairness")
                      ),
                    S.listItem()
                      .title("🏅 Winners Feed Header")
                      .child(
                        S.document()
                          .schemaType("sectionContent")
                          .documentId("section-winners-feed")
                      ),
                    S.listItem()
                      .title("🔢 Draws Explorer Header")
                      .child(
                        S.document()
                          .schemaType("sectionContent")
                          .documentId("section-draws-explorer")
                      ),
                    S.divider(),
                    S.documentTypeListItem("sectionContent").title("📁 All Page Sections"),
                  ])
              ),

            S.divider(),

            // ══════════════════════════════════════════════════════════
            // 3. Draws & Raffle Catalog
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("🎟️ Draws & Ticket Catalog")
              .child(
                S.list()
                  .title("Lottery Draws")
                  .items([
                    S.documentTypeListItem("draw").title("📁 All Lottery Draws (Catalog)"),
                    S.divider(),
                    S.listItem()
                      .title("🟢 Open Active Draws")
                      .child(
                        S.documentList()
                          .title("Active Draws Accepting Entries")
                          .filter('_type == "draw" && status == "open"')
                      ),
                    S.listItem()
                      .title("🟡 Upcoming Scheduled Draws")
                      .child(
                        S.documentList()
                          .title("Upcoming Draws")
                          .filter('_type == "draw" && status == "upcoming"')
                      ),
                    S.listItem()
                      .title("🔒 Completed Draws")
                      .child(
                        S.documentList()
                          .title("Completed Draws")
                          .filter('_type == "draw" && (status == "closed" || status == "revealed")')
                      ),
                  ])
              ),

            // ══════════════════════════════════════════════════════════
            // 4. Ticket Entries & Payment Screenshots
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("💳 Ticket Entries & Payment Screenshots")
              .child(
                S.list()
                  .title("Player Entries & Verification")
                  .items([
                    S.listItem()
                      .title("📸 With Screenshot Attached")
                      .child(
                        S.documentList()
                          .title("Entries With Payment Screenshots")
                          .filter('_type == "playerEntry" && defined(proofScreenshot)')
                      ),
                    S.listItem()
                      .title("🟡 Pending Approval (Needs Verification)")
                      .child(
                        S.documentList()
                          .title("Unverified Payment Submissions")
                          .filter('_type == "playerEntry" && status == "pending"')
                      ),
                    S.listItem()
                      .title("🟢 Approved Entries")
                      .child(
                        S.documentList()
                          .title("Approved Purchases")
                          .filter('_type == "playerEntry" && status == "confirmed"')
                      ),
                    S.listItem()
                      .title("🔴 Rejected Entries")
                      .child(
                        S.documentList()
                          .title("Rejected Submissions")
                          .filter('_type == "playerEntry" && status == "rejected"')
                      ),
                    S.divider(),
                    S.documentTypeListItem("playerEntry").title("📁 All Player Entries"),
                  ])
              ),

            // ══════════════════════════════════════════════════════════
            // 5. Results & Payout Audits
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("🏆 Results & Winning Numbers")
              .child(
                S.list()
                  .title("Results & Verification")
                  .items([
                    S.documentTypeListItem("drawResult").title("🥇 Top 10 Winning Outcomes"),
                  ])
              ),

            // ══════════════════════════════════════════════════════════
            // 6. Customer Care & Inbox
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("📬 Customer Care & Inbox")
              .child(
                S.list()
                  .title("Contact Submissions")
                  .items([
                    S.listItem()
                      .title("🔴 New Inquiries")
                      .child(
                        S.documentList()
                          .title("New Unread Messages")
                          .filter('_type == "contactMessage" && status == "new"')
                      ),
                    S.listItem()
                      .title("🟢 Resolved Inquiries")
                      .child(
                        S.documentList()
                          .title("Resolved Messages")
                          .filter('_type == "contactMessage" && status == "resolved"')
                      ),
                    S.divider(),
                    S.documentTypeListItem("contactMessage").title("📁 All Inbox Messages"),
                  ])
              ),

            S.divider(),

            // ══════════════════════════════════════════════════════════
            // 7. Platform Settings & Multilingual Dictionary
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("🌐 Platform Settings & Languages")
              .child(
                S.list()
                  .title("Settings & Translations")
                  .items([
                    S.listItem()
                      .title("⚙️ Global Site Settings & Hotlines")
                      .child(
                        S.document()
                          .schemaType("siteSettings")
                          .documentId("siteSettings")
                      ),
                    S.documentTypeListItem("translation").title("🌍 Multilingual Dictionary (All Strings)"),
                    S.documentTypeListItem("faq").title("💬 FAQs & Help Center"),
                  ])
              ),
          ]),
    }),
    visionTool(),
  ],
  schema,
});
