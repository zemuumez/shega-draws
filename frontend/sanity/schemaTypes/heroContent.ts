import { defineField, defineType, defineArrayMember } from "sanity";

export const heroContentType = defineType({
  name: "heroContent",
  title: "Hero Banner Content",
  type: "document",
  fieldsets: [
    {
      name: "headline",
      title: "🌟 Headline & Call-to-Action",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "multilingual",
      title: "🌍 Multilingual Translations",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "badges",
      title: "🏅 Trust Badges & Labels",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "media",
      title: "🎨 Background & Media",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    // ─── Headline & CTA ────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Hero Title (English)",
      type: "string",
      fieldset: "headline",
      placeholder: "One Dream Villa. One Electric SUV. Eight More Life-Changing Rewards.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Hero Subtitle / Description (English)",
      type: "text",
      rows: 3,
      fieldset: "headline",
      placeholder: "Pick your lucky number, choose your pool capacity, and watch our founders draw the 10 winning numbers live on video stream.",
    }),
    defineField({
      name: "ctaPrimaryText",
      title: "Primary CTA Button Text",
      type: "string",
      fieldset: "headline",
      placeholder: "Enter Active Draw",
      initialValue: "Enter Active Draw",
    }),
    defineField({
      name: "ctaSecondaryText",
      title: "Secondary CTA Button Text",
      type: "string",
      fieldset: "headline",
      placeholder: "View Results & Live Stream",
      initialValue: "View Results & Live Stream",
    }),

    // ─── Multilingual ──────────────────────────────────────────────────
    defineField({
      name: "titleAm",
      title: "Hero Title (Amharic / አማርኛ)",
      type: "string",
      fieldset: "multilingual",
      placeholder: "አንድ ዘመናዊ ቪላ። አንድ የኤሌክትሪክ መኪና። ስምንት ሌሎች ከፍተኛ ሽልማቶች።",
    }),
    defineField({
      name: "titleOm",
      title: "Hero Title (Afaan Oromoo)",
      type: "string",
      fieldset: "multilingual",
      placeholder: "Viilaa Tokko. Konkolaataa Elektiriki Tokko. Badhaasa Guddaa Sadarkaa 8.",
    }),
    defineField({
      name: "titleTi",
      title: "Hero Title (Tigrinya / ትግርኛ)",
      type: "string",
      fieldset: "multilingual",
    }),
    defineField({
      name: "subtitleAm",
      title: "Hero Subtitle (Amharic / አማርኛ)",
      type: "text",
      rows: 3,
      fieldset: "multilingual",
      placeholder: "ከ00 እስከ 99 የሚወዱትን ቁጥር ይምረጡ፣ በቴሌብር ወይም በሲቢኢ ብር ይክፈሉ...",
    }),
    defineField({
      name: "subtitleOm",
      title: "Hero Subtitle (Afaan Oromoo)",
      type: "text",
      rows: 3,
      fieldset: "multilingual",
      placeholder: "Lakkoofsa 00 hanga 99 filadhaa, Telebirr ykn CBE Birr kaffalaa...",
    }),
    defineField({
      name: "subtitleTi",
      title: "Hero Subtitle (Tigrinya / ትግርኛ)",
      type: "text",
      rows: 3,
      fieldset: "multilingual",
    }),

    // ─── Trust Badges ──────────────────────────────────────────────────
    defineField({
      name: "trustBadges",
      title: "Trust Badge Labels",
      type: "array",
      fieldset: "badges",
      of: [
        defineArrayMember({
          type: "object",
          name: "trustBadge",
          fields: [
            defineField({ name: "text", title: "Badge Text (English)", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "textAm", title: "Badge Text (Amharic)", type: "string" }),
            defineField({ name: "textOm", title: "Badge Text (Afaan Oromoo)", type: "string" }),
            defineField({
              name: "color",
              title: "Badge Color Theme",
              type: "string",
              options: {
                list: [
                  { title: "🟡 Gold (Default)", value: "gold" },
                  { title: "🟢 Green (Trust)", value: "green" },
                  { title: "🔵 Blue (Info)", value: "blue" },
                  { title: "🔴 Red (Urgent)", value: "red" },
                ],
              },
              initialValue: "gold",
            }),
          ],
          preview: {
            select: { title: "text", color: "color" },
            prepare({ title, color }) {
              const icon = color === "green" ? "🟢" : color === "blue" ? "🔵" : color === "red" ? "🔴" : "🟡";
              return { title: `${icon} ${title || "Badge"}` };
            },
          },
        }),
      ],
    }),

    // ─── Media ─────────────────────────────────────────────────────────
    defineField({
      name: "backgroundImage",
      title: "Hero Background Image",
      type: "image",
      fieldset: "media",
      options: { hotspot: true },
    }),
    defineField({
      name: "miniCardImage",
      title: "Mini Card / Countdown Image",
      type: "image",
      fieldset: "media",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return {
        title: title || "Hero Banner",
        subtitle: "Homepage Hero Section Content",
      };
    },
  },
});
