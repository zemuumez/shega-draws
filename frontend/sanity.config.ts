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
            // ══════════════════════════════════════════════════════════
            // Section 1: Lottery & Draw Management
            // ══════════════════════════════════════════════════════════
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

            // ══════════════════════════════════════════════════════════
            // Section 2: Ticket Entries & Payment Screenshots
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("💳 Ticket Entries & Payment Screenshots")
              .child(
                S.list()
                  .title("Payment Proof Verifications")
                  .items([
                    S.listItem()
                      .title("🟡 Pending Approval (Needs Verification)")
                      .child(
                        S.documentList()
                          .title("Unverified Payment Screenshots")
                          .filter('_type == "playerEntry" && status == "pending"')
                      ),
                    S.listItem()
                      .title("🟢 Confirmed & Approved Entries")
                      .child(
                        S.documentList()
                          .title("Approved Ticket Purchases")
                          .filter('_type == "playerEntry" && status == "confirmed"')
                      ),
                    S.listItem()
                      .title("🔴 Rejected Entries (Invalid Proof)")
                      .child(
                        S.documentList()
                          .title("Rejected Submissions")
                          .filter('_type == "playerEntry" && status == "rejected"')
                      ),
                    S.divider(),
                    S.listItem()
                      .title("📸 With Screenshot Attached")
                      .child(
                        S.documentList()
                          .title("Entries With Payment Screenshots")
                          .filter('_type == "playerEntry" && defined(proofScreenshot)')
                      ),
                    S.documentTypeListItem("playerEntry").title("📁 All Player Entries & Screenshots"),
                  ])
              ),

            // ══════════════════════════════════════════════════════════
            // Section 3: Featured Jackpot Cards & Ad Banners
            // ══════════════════════════════════════════════════════════
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

            // ══════════════════════════════════════════════════════════
            // Section 4: Results & Payout Audits
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
            // Section 5: Customer Care & Inbox
            // ══════════════════════════════════════════════════════════
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

            // ══════════════════════════════════════════════════════════
            // Section 6: Website Content & Page Sections
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("📝 Website Content & Sections")
              .child(
                S.list()
                  .title("Editable Page Content")
                  .items([
                    S.listItem()
                      .title("🌟 Hero Banner (Homepage)")
                      .child(
                        S.document()
                          .schemaType("heroContent")
                          .documentId("heroContent")
                      ),
                    S.divider(),
                    S.listItem()
                      .title("📐 How It Works Section")
                      .child(
                        S.documentList()
                          .title("How It Works")
                          .filter('_type == "sectionContent" && sectionKey == "how-it-works"')
                      ),
                    S.listItem()
                      .title("🎯 Why Rimna Lottery Section")
                      .child(
                        S.documentList()
                          .title("Why Rimna")
                          .filter('_type == "sectionContent" && sectionKey == "why-rimna"')
                      ),
                    S.listItem()
                      .title("📺 Live Broadcast Banner")
                      .child(
                        S.documentList()
                          .title("Live Broadcast")
                          .filter('_type == "sectionContent" && sectionKey == "live-broadcast"')
                      ),
                    S.listItem()
                      .title("🔐 Cryptographic Fairness")
                      .child(
                        S.documentList()
                          .title("Fairness Section")
                          .filter('_type == "sectionContent" && sectionKey == "fairness"')
                      ),
                    S.listItem()
                      .title("🏅 Winners Feed Section")
                      .child(
                        S.documentList()
                          .title("Winners Feed")
                          .filter('_type == "sectionContent" && sectionKey == "winners-feed"')
                      ),
                    S.listItem()
                      .title("🎮 Quick Pick / Number Selector")
                      .child(
                        S.documentList()
                          .title("Quick Pick Section")
                          .filter('_type == "sectionContent" && sectionKey == "quick-pick"')
                      ),
                    S.listItem()
                      .title("🔢 Draws Explorer Header")
                      .child(
                        S.documentList()
                          .title("Draws Explorer")
                          .filter('_type == "sectionContent" && sectionKey == "draws-explorer"')
                      ),
                    S.divider(),
                    S.documentTypeListItem("sectionContent").title("📁 All Page Sections"),
                  ])
              ),

            // ══════════════════════════════════════════════════════════
            // Section 7: Testimonials & Social Proof
            // ══════════════════════════════════════════════════════════
            S.listItem()
              .title("⭐ Testimonials & Social Proof")
              .child(
                S.list()
                  .title("Customer Reviews")
                  .items([
                    S.listItem()
                      .title("🟢 Active Testimonials (Showing)")
                      .child(
                        S.documentList()
                          .title("Active Testimonials")
                          .filter('_type == "testimonial" && isActive == true')
                      ),
                    S.documentTypeListItem("testimonial").title("📁 All Testimonials"),
                  ])
              ),

            S.divider(),

            // ══════════════════════════════════════════════════════════
            // Section 8: Platform Settings & Multilingual
            // ══════════════════════════════════════════════════════════
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
                    S.divider(),
                    // Translation filtered by category
                    S.listItem()
                      .title("🧭 Navigation & Header Strings")
                      .child(
                        S.documentList()
                          .title("Navigation Translations")
                          .filter('_type == "translation" && category == "nav"')
                      ),
                    S.listItem()
                      .title("🌟 Hero & CTA Strings")
                      .child(
                        S.documentList()
                          .title("Hero Translations")
                          .filter('_type == "translation" && category == "hero"')
                      ),
                    S.listItem()
                      .title("🎟️ Tickets & Catalog Strings")
                      .child(
                        S.documentList()
                          .title("Ticket Translations")
                          .filter('_type == "translation" && (category == "tickets" || category == "draws")')
                      ),
                    S.listItem()
                      .title("🛒 Buy Modal & Checkout Strings")
                      .child(
                        S.documentList()
                          .title("Modal Translations")
                          .filter('_type == "translation" && category == "modal"')
                      ),
                    S.listItem()
                      .title("🏆 Results & Prize Strings")
                      .child(
                        S.documentList()
                          .title("Results Translations")
                          .filter('_type == "translation" && category == "results"')
                      ),
                    S.listItem()
                      .title("🛡️ Trust & Fairness Strings")
                      .child(
                        S.documentList()
                          .title("Trust Translations")
                          .filter('_type == "translation" && (category == "trust" || category == "fairness")')
                      ),
                    S.listItem()
                      .title("📄 Footer & Support Strings")
                      .child(
                        S.documentList()
                          .title("Footer Translations")
                          .filter('_type == "translation" && (category == "footer" || category == "support")')
                      ),
                    S.divider(),
                    S.documentTypeListItem("translation").title("🌍 All Translation Strings"),
                    S.documentTypeListItem("faq").title("💬 Help & FAQs"),
                  ])
              ),
          ]),
    }),
    visionTool(),
  ],
  schema,
});
