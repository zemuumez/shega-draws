import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "demo-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  basePath: "/studio",
  name: "rimna_lottery_cms",
  title: "Rimna Digital Lottery CMS Studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Rimna Lottery Control Center")
          .items([
            // ── Section 1: Lottery & Draw Management ────────────────
            S.listItem()
              .title("🎟️ Lottery & Draws Management")
              .child(
                S.list()
                  .title("Lottery Draws")
                  .items([
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
                      .title("🔒 Closed / Completed Draws")
                      .child(
                        S.documentList()
                          .title("Completed Draws")
                          .filter('_type == "draw" && (status == "closed" || status == "revealed")')
                      ),
                    S.divider(),
                    S.documentTypeListItem("draw").title("📁 All Lottery Draws (Catalog)"),
                  ])
              ),

            // ── Section 2: Featured Jackpot Cards & Ad Banners ──────
            S.listItem()
              .title("📢 Jackpot Cards & Ad Banners")
              .child(
                S.list()
                  .title("Banners & Ad Management")
                  .items([
                    S.documentTypeListItem("jackpotCard").title("🌟 Top 3 Hero Jackpot Cards"),
                    S.documentTypeListItem("promotion").title("✨ Special Holiday & Promos"),
                  ])
              ),

            // ── Section 3: Results & Payout Audits ───────────────────
            S.listItem()
              .title("🏆 Results & Winning Numbers")
              .child(
                S.list()
                  .title("Results & Verification")
                  .items([
                    S.documentTypeListItem("drawResult").title("🥇 Top 10 Winning Outcomes"),
                  ])
              ),

            // ── Section 4: Customer Care & Inbox ─────────────────────
            S.listItem()
              .title("📬 Customer Care & Inbox")
              .child(
                S.list()
                  .title("Contact Submissions")
                  .items([
                    S.listItem()
                      .title("🔴 New Inquiries (Needs Action)")
                      .child(
                        S.documentList()
                          .title("New Unread Inquiries")
                          .filter('_type == "contactMessage" && status == "new"')
                      ),
                    S.listItem()
                      .title("🟡 In Progress")
                      .child(
                        S.documentList()
                          .title("In Progress Messages")
                          .filter('_type == "contactMessage" && status == "in_progress"')
                      ),
                    S.listItem()
                      .title("🟢 Resolved")
                      .child(
                        S.documentList()
                          .title("Resolved Inquiries")
                          .filter('_type == "contactMessage" && status == "resolved"')
                      ),
                    S.divider(),
                    S.documentTypeListItem("contactMessage").title("📁 All Inbox Submissions"),
                  ])
              ),

            S.divider(),

            // ── Section 5: Platform Settings & Translations ─────────
            S.listItem()
              .title("🌐 Platform & Multilingual Config")
              .child(
                S.list()
                  .title("Platform Configuration")
                  .items([
                    S.listItem()
                      .title("⚙️ Global Site Settings & Hotlines")
                      .child(
                        S.document()
                          .schemaType("siteSettings")
                          .documentId("siteSettings")
                      ),
                    S.documentTypeListItem("translation").title("🌍 Multilingual Dictionaries (EN/AM/OM/TI)"),
                    S.documentTypeListItem("faq").title("💬 Help & FAQs"),
                  ])
              ),
          ]),
    }),
    visionTool(),
  ],
  schema,
});
