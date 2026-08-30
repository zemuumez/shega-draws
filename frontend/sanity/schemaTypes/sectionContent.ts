import { defineField, defineType, defineArrayMember } from "sanity";

export const sectionContentType = defineType({
  name: "sectionContent",
  title: "Page Section Content",
  type: "document",
  fieldsets: [
    {
      name: "identity",
      title: "🔑 Section Identity",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "content",
      title: "📝 Content (English)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "multilingual",
      title: "🌍 Multilingual Translations",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "features",
      title: "⭐ Feature Cards / Steps",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    // ─── Identity ──────────────────────────────────────────────────────
    defineField({
      name: "sectionKey",
      title: "Section Key (Unique Identifier)",
      type: "string",
      fieldset: "identity",
      description: "Used to match this content to a frontend section. Do not change after creation.",
      options: {
        list: [
          { title: "How It Works", value: "how-it-works" },
          { title: "Why Rimna Lottery", value: "why-rimna" },
          { title: "Live Broadcast Banner", value: "live-broadcast" },
          { title: "Cryptographic Fairness", value: "fairness" },
          { title: "Winners Feed", value: "winners-feed" },
          { title: "Quick Pick / Number Selector", value: "quick-pick" },
          { title: "Prize Spotlight", value: "prize-spotlight" },
          { title: "Draws Explorer Header", value: "draws-explorer" },
          { title: "Footer Content", value: "footer" },
          { title: "About Page", value: "about" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isActive",
      title: "Active (Published)",
      type: "boolean",
      fieldset: "identity",
      initialValue: true,
    }),

    // ─── English Content ───────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Section Title (English)",
      type: "string",
      fieldset: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Section Subtitle (English)",
      type: "text",
      rows: 2,
      fieldset: "content",
    }),
    defineField({
      name: "body",
      title: "Body Text / Rich Description (English)",
      type: "text",
      rows: 5,
      fieldset: "content",
    }),
    defineField({
      name: "ctaText",
      title: "CTA Button Text",
      type: "string",
      fieldset: "content",
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Target Link",
      type: "string",
      fieldset: "content",
    }),

    // ─── Multilingual ──────────────────────────────────────────────────
    defineField({
      name: "titleAm",
      title: "Title (Amharic / አማርኛ)",
      type: "string",
      fieldset: "multilingual",
    }),
    defineField({
      name: "titleOm",
      title: "Title (Afaan Oromoo)",
      type: "string",
      fieldset: "multilingual",
    }),
    defineField({
      name: "titleTi",
      title: "Title (Tigrinya / ትግርኛ)",
      type: "string",
      fieldset: "multilingual",
    }),
    defineField({
      name: "subtitleAm",
      title: "Subtitle (Amharic / አማርኛ)",
      type: "text",
      rows: 2,
      fieldset: "multilingual",
    }),
    defineField({
      name: "subtitleOm",
      title: "Subtitle (Afaan Oromoo)",
      type: "text",
      rows: 2,
      fieldset: "multilingual",
    }),
    defineField({
      name: "subtitleTi",
      title: "Subtitle (Tigrinya / ትግርኛ)",
      type: "text",
      rows: 2,
      fieldset: "multilingual",
    }),
    defineField({
      name: "bodyAm",
      title: "Body Text (Amharic / አማርኛ)",
      type: "text",
      rows: 5,
      fieldset: "multilingual",
    }),
    defineField({
      name: "bodyOm",
      title: "Body Text (Afaan Oromoo)",
      type: "text",
      rows: 5,
      fieldset: "multilingual",
    }),

    // ─── Feature Cards / Steps ─────────────────────────────────────────
    defineField({
      name: "features",
      title: "Feature Cards / Steps",
      type: "array",
      fieldset: "features",
      description: "Add step-by-step cards, feature selling points, or info cards for this section.",
      of: [
        defineArrayMember({
          type: "object",
          name: "featureCard",
          fields: [
            defineField({ name: "icon", title: "Icon Name (Lucide)", type: "string", placeholder: "Trophy, Tv, Users, ShieldCheck, Ticket, CreditCard" }),
            defineField({ name: "title", title: "Card Title (English)", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "description", title: "Card Description (English)", type: "text", rows: 2 }),
            defineField({ name: "titleAm", title: "Card Title (Amharic)", type: "string" }),
            defineField({ name: "descriptionAm", title: "Card Description (Amharic)", type: "text", rows: 2 }),
            defineField({ name: "titleOm", title: "Card Title (Afaan Oromoo)", type: "string" }),
            defineField({ name: "descriptionOm", title: "Card Description (Afaan Oromoo)", type: "text", rows: 2 }),
            defineField({
              name: "color",
              title: "Card Color Theme",
              type: "string",
              options: {
                list: [
                  { title: "🟡 Gold / Yellow", value: "gold" },
                  { title: "🔵 Blue", value: "blue" },
                  { title: "🟢 Green", value: "green" },
                  { title: "🔴 Red", value: "red" },
                  { title: "⚪ Default / Gray", value: "default" },
                ],
              },
              initialValue: "default",
            }),
          ],
          preview: {
            select: { title: "title", icon: "icon" },
            prepare({ title, icon }) {
              return { title: title || "Feature Card", subtitle: icon ? `Icon: ${icon}` : "" };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      sectionKey: "sectionKey",
      isActive: "isActive",
    },
    prepare({ title, sectionKey, isActive }) {
      return {
        title: title || "Untitled Section",
        subtitle: `${isActive ? "🟢 Active" : "⚪ Draft"} · Key: ${sectionKey || "unset"}`,
      };
    },
  },
});
