import { defineField, defineType } from "sanity";

export const translationType = defineType({
  name: "translation",
  title: "Multilingual Dictionary String",
  type: "document",
  fields: [
    defineField({
      name: "key",
      title: "Translation Key / Identifier",
      type: "string",
      placeholder: "nav.draws, hero.headline, modal.buy_now, trust.guaranteed",
      description: "Code identifier used in frontend components. Format: section.subkey",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Editor Description",
      type: "string",
      description: "Brief note explaining where this text appears on the website (for editors only).",
      placeholder: "Navigation bar → Draws link text",
    }),
    defineField({
      name: "category",
      title: "Content Category",
      type: "string",
      options: {
        list: [
          { title: "🧭 Navigation & Header", value: "nav" },
          { title: "🌟 Hero Banner & CTA", value: "hero" },
          { title: "🎟️ Tickets & Catalog", value: "tickets" },
          { title: "🛒 Buy Modal & Checkout", value: "modal" },
          { title: "🏆 Results & Prizes", value: "results" },
          { title: "🛡️ Trust & Transparency", value: "trust" },
          { title: "💬 Support & Contact", value: "support" },
          { title: "📢 Promotions & Events", value: "promo" },
          { title: "📄 Footer", value: "footer" },
          { title: "ℹ️ About Page", value: "about" },
          { title: "📊 Sidebar Widgets", value: "sidebar" },
          { title: "⭐ Testimonials", value: "testimonials" },
          { title: "❓ FAQ & Help", value: "faq" },
          { title: "🎮 Quick Pick & Number Selector", value: "quickpick" },
          { title: "🔢 Draws Explorer", value: "draws" },
          { title: "🏅 Winners Feed", value: "winners" },
          { title: "📐 Fairness & Verification", value: "fairness" },
          { title: "📝 How It Works", value: "howitworks" },
        ],
      },
      initialValue: "nav",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "en",
      title: "English (en)",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "am",
      title: "Amharic (አማርኛ - am)",
      type: "text",
      rows: 2,
      placeholder: "የአማርኛ ትርጉም...",
    }),
    defineField({
      name: "om",
      title: "Afaan Oromoo (om)",
      type: "text",
      rows: 2,
      placeholder: "Hiikkaa Afaan Oromoo...",
    }),
    defineField({
      name: "ti",
      title: "Tigrinya (ትግርኛ - ti)",
      type: "text",
      rows: 2,
      placeholder: "ትርጉም ትግርኛ...",
    }),
  ],
  preview: {
    select: {
      title: "key",
      category: "category",
      en: "en",
      description: "description",
    },
    prepare({ title, category, en, description }) {
      return {
        title: title || "Translation Key",
        subtitle: `[${category || "general"}] ${description || en || ""}`,
      };
    },
  },
});
