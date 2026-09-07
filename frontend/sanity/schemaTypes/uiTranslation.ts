import { defineField, defineType } from "sanity";

export const uiTranslationType = defineType({
  name: "uiTranslation",
  title: "🌐 UI Translation Strings",
  type: "document",
  fields: [
    defineField({
      name: "key",
      title: "Translation Key Identifier",
      type: "string",
      description: "Unique dot-notation key (e.g. 'nav.buyTicket', 'hero.enterCta', 'faq.q1')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "UI Section Category",
      type: "string",
      options: {
        list: [
          { title: "🧭 Navigation & Header", value: "nav" },
          { title: "🌟 Hero & Countdown Banner", value: "hero" },
          { title: "🎟️ Ticket Configurator & Purchase", value: "ticket" },
          { title: "🎰 Draws & Catalog Explorer", value: "draws" },
          { title: "🛡️ Fairness & Transparency", value: "fairness" },
          { title: "🏆 Winners & Payouts Feed", value: "winners" },
          { title: "❓ FAQs & Guides", value: "faq" },
          { title: "💬 Testimonials & Community", value: "testimonials" },
          { title: "💳 Payments & Accounts", value: "payments" },
          { title: "📌 Footer & Legal", value: "footer" },
          { title: "⚙️ General / Other", value: "general" },
        ],
      },
      initialValue: "general",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Context / Description for Editors",
      type: "string",
      description: "Explains where and how this text is used on the website.",
    }),
    defineField({
      name: "en",
      title: "🇬🇧 English Translation",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "am",
      title: "🇪🇹 Amharic (አማርኛ) Translation",
      type: "text",
      rows: 2,
      placeholder: "የአማርኛ ትርጉም እዚህ ይፃፉ...",
    }),
    defineField({
      name: "ti",
      title: "🇪🇹 Tigrinya (ትግርኛ) Translation",
      type: "text",
      rows: 2,
      placeholder: "ናይ ትግርኛ ትርጉም ኣብዚ ይጸሓፉ...",
    }),
  ],
  preview: {
    select: {
      key: "key",
      category: "category",
      en: "en",
      am: "am",
      ti: "ti",
    },
    prepare({ key, category, en, am, ti }) {
      const hasAm = !!am ? "🟢 አማ" : "⚪ አማ";
      const hasTi = !!ti ? "🟢 ትግ" : "⚪ ትግ";
      return {
        title: key || "Untitled Translation",
        subtitle: `[${category || "general"}] ${en || ""} | ${hasAm} ${hasTi}`,
      };
    },
  },
});
