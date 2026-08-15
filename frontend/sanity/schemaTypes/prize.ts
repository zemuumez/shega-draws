import { defineField, defineType } from "sanity";

export const prizeType = defineType({
  name: "prize",
  title: "Prize",
  type: "object",
  fields: [
    defineField({
      name: "rank",
      title: "Rank / Tier Number",
      type: "number",
      description: "1 = 1st Prize (Grand Prize), 2 = 2nd Prize, 3 = 3rd Prize...",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "label",
      title: "Badge Label (English)",
      type: "string",
      placeholder: "1st Prize · Grand Jackpot",
      description: "Suggestions: 1st Prize · Grand Jackpot | 2nd Prize · Luxury EV | 3rd Prize · Tech Bundle | 4th–10th Prizes · Cash Rewards",
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
      description: "Suggestions: Luxury Villa | 2026 Toyota bZ4X EV | iPhone 16 Pro Max + MacBook | ETB 100,000 Cash Transfer",
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
      title: "Monetary Value (Display)",
      type: "string",
      placeholder: "ETB 15,000,000",
    }),
    defineField({
      name: "description",
      title: "Prize Specifications / Details",
      type: "text",
      rows: 2,
      placeholder: "G+2 fully finished smart home with solar backup, compound, and parking.",
    }),
    defineField({
      name: "image",
      title: "Prize Photo",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: "prizeTitle",
      subtitle: "label",
      rank: "rank",
      value: "valueAmount",
      media: "image",
    },
    prepare({ title, subtitle, rank, value, media }) {
      return {
        title: title || `Prize #${rank}`,
        subtitle: `${subtitle ?? `Rank #${rank}`} ${value ? `(${value})` : ""}`,
        media,
      };
    },
  },
});
