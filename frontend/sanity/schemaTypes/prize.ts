import { defineField, defineType } from "sanity";

export const prizeType = defineType({
  name: "prize",
  title: "Prize",
  type: "object",
  fields: [
    defineField({
      name: "rank",
      title: "Rank / Position",
      type: "number",
      description: "1 for 1st Prize (Grand Jackpot), 2 for 2nd Prize, etc.",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "label",
      title: "Badge Label (English)",
      type: "string",
      placeholder: "1st Prize · Grand Jackpot",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "labelAm",
      title: "Badge Label (Amharic / አማርኛ)",
      type: "string",
      placeholder: "1ኛ ዕጣ · ዋና ጃክፖት",
    }),
    defineField({
      name: "labelOm",
      title: "Badge Label (Afaan Oromoo)",
      type: "string",
      placeholder: "Carraa 1ffaa · Badhaasa Guddaa",
    }),
    defineField({
      name: "prizeTitle",
      title: "Prize Title (English)",
      type: "string",
      placeholder: "Luxury Villa in Bole Bulbula",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "prizeTitleAm",
      title: "Prize Title (Amharic / አማርኛ)",
      type: "string",
      placeholder: "ዘመናዊ ቪላ ቤት በቦሌ ቡልቡላ",
    }),
    defineField({
      name: "prizeTitleOm",
      title: "Prize Title (Afaan Oromoo)",
      type: "string",
      placeholder: "Manna Viillaa Ammayyaa Boolee Bulbulaa",
    }),
    defineField({
      name: "valueAmount",
      title: "Estimated Monetary Value",
      type: "string",
      placeholder: "ETB 15,000,000",
    }),
    defineField({
      name: "description",
      title: "Prize Details / Specifications",
      type: "text",
      rows: 3,
      placeholder: "G+2 fully furnished 4-bedroom villa with smart security and garden.",
    }),
    defineField({
      name: "image",
      title: "Prize Photograph / Asset",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "prizeTitle",
      subtitle: "label",
      rank: "rank",
      media: "image",
    },
    prepare({ title, subtitle, rank, media }) {
      return {
        title: title || `Prize #${rank}`,
        subtitle: subtitle ? `#${rank} — ${subtitle}` : `Rank #${rank}`,
        media,
      };
    },
  },
});
