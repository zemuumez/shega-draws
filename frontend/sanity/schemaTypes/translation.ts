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
      description: "Code identifier used in frontend components",
      validation: (Rule) => Rule.required(),
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
    },
    prepare({ title, category, en }) {
      return {
        title: title || "Translation Key",
        subtitle: `[${category || "general"}] ${en || ""}`,
      };
    },
  },
});
