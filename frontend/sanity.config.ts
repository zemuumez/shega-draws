import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "demo-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  basePath: "/studio",
  name: "shega_draws_cms",
  title: "Shega Draws Studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content & Campaigns")
          .items([
            S.documentTypeListItem("draw").title("🎟️ Jackpots & Draws"),
            S.documentTypeListItem("promotion").title("✨ Promotions & Banners"),
            S.documentTypeListItem("faq").title("💬 Help & FAQs"),
            S.divider(),
            S.listItem()
              .title("⚙️ Global Platform Settings")
              .child(
                S.editor()
                  .id("siteSettings")
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
          ]),
    }),
    visionTool(),
  ],
  schema,
});
