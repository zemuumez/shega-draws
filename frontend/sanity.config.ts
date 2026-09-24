import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes";
import { translationCatalog } from "./lib/i18n/catalog";
import { BackupView } from "./sanity/components/BackupView";
export default defineConfig({
  basePath: "/studio",
  name: "rimna_content",
  title: "Rimna Website Content",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Website content")
          .items([
            S.listItem()
              .title("Site settings & language")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
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
                      .child(
                        S.documentTypeList("uiTranslation").title(
                          "All UI Translations",
                        ),
                      ),
                    ...[
                      ["nav", "🧭 Navigation & Header"],
                      ["hero", "🌟 Hero & Countdown"],
                      ["ticket", "🎟️ Tickets, Checkout & Interface"],
                      ["draws", "🎰 Draws & Results"],
                      ["fairness", "🛡️ Fairness"],
                      ["winners", "🏆 Winners"],
                      ["faq", "❓ FAQs & Guides"],
                      ["testimonials", "💬 Testimonials"],
                      ["payments", "💳 Payments"],
                      ["footer", "📌 Footer"],
                      ["general", "⚙️ Other Website Text"],
                    ].map(([category, title]) =>
                      S.listItem()
                        .id(category)
                        .title(title)
                        .child(
                          S.list()
                            .title(title)
                            .items(
                              translationCatalog
                                .filter((entry) => entry.category === category)
                                .map((entry) =>
                                  S.listItem()
                                    .id(entry._id)
                                    .title(entry.key)
                                    .child(
                                      S.document()
                                        .schemaType("uiTranslation")
                                        .documentId(entry._id)
                                        .initialValueTemplate(
                                          "website-translation",
                                          { key: entry.key },
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                  ]),
              ),

            // 6. Promotional Ads & Featured Prizes
            S.documentTypeListItem("advertisement").title(
              "📢 Promotional Ads & Featured Prizes",
            ),

            // 7. Winner Testimonials
            S.documentTypeListItem("testimonial").title(
              "💬 Winner Testimonials",
            ),

            S.listItem()
              .title("Content backup & restore")
              .child(S.component(BackupView).title("Content backup & restore")),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    ...schema,
    templates: (prev) => [
      ...prev,
      {
        id: "website-translation",
        title: "Website translation",
        schemaType: "uiTranslation",
        parameters: [{ name: "key", type: "string" }],
        value: ({ key }: { key: string }) => {
          const entry = translationCatalog.find((item) => item.key === key);
          return entry
            ? {
                key: entry.key,
                category: entry.category,
                en: entry.en,
                am: entry.am,
                ti: entry.ti,
              }
            : { key };
        },
      },
    ],
  },
});
