import { defineField, defineType } from "sanity";

export const advertisementType = defineType({
  name: "advertisement",
  title: "📢 Promotional Ads & Featured Prizes",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Advertisement Headline / Prize Name (English)",
      type: "string",
      placeholder: "e.g. Brand New 2026 Electric Luxury SUV",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleAm",
      title: "Advertisement Headline / Prize Name (Amharic - አማርኛ)",
      type: "string",
      placeholder: "e.g. አዲስ 2026 የቅንጦት ኤሌክትሪክ መኪና",
    }),
    defineField({
      name: "titleTi",
      title: "Advertisement Headline / Prize Name (Tigrinya - ትግርኛ)",
      type: "string",
      placeholder: "e.g. ሓዱሽ 2026 ናይ ቅንጦት ኤሌክትሪክ መኪና",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / Prize Description (English)",
      type: "text",
      rows: 2,
      placeholder: "e.g. 100% Guaranteed payout in our 500 Birr Grand Pool. Zero rollover delays.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitleAm",
      title: "Subtitle / Prize Description (Amharic - አማርኛ)",
      type: "text",
      rows: 2,
      placeholder: "e.g. በ500 ብር እጣችን 100% ዋስትና ያለው ሽልማት።",
    }),
    defineField({
      name: "subtitleTi",
      title: "Subtitle / Prize Description (Tigrinya - ትግርኛ)",
      type: "text",
      rows: 2,
      placeholder: "e.g. ኣብ 500 ብር ዕጫና 100% ውሕስነት ዘለዎ ሽልማት።",
    }),
    defineField({
      name: "badge",
      title: "Ad Category Badge (English)",
      type: "string",
      placeholder: "e.g. 🚗 GRAND PRIZE or 🏡 LUXURY VILLA or ⚡ SMART APPLIANCES",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "badgeAm",
      title: "Ad Category Badge (Amharic - አማርኛ)",
      type: "string",
      placeholder: "e.g. 🚗 ታላቅ ሽልማት ወይም 🏡 ዘመናዊ ቪላ",
    }),
    defineField({
      name: "badgeTi",
      title: "Ad Category Badge (Tigrinya - ትግርኛ)",
      type: "string",
      placeholder: "e.g. 🚗 ዓቢይ ሽልማት ወይ 🏡 ዘመናዊ ቪላ",
    }),
    defineField({
      name: "image",
      title: "Advertisement / Reward Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "estimatedValue",
      title: "Estimated Cash / Prize Value",
      type: "string",
      placeholder: "e.g. 4,500,000 ETB or $35,000 USD",
    }),
    defineField({
      name: "targetDrawId",
      title: "Target Draw Reference Code",
      type: "string",
      placeholder: "e.g. RDL-ETB-500",
    }),
    defineField({
      name: "ctaText",
      title: "Call To Action Button Text (English)",
      type: "string",
      initialValue: "Enter Draw & Win",
    }),
    defineField({
      name: "ctaTextAm",
      title: "Call To Action Button Text (Amharic - አማርኛ)",
      type: "string",
      initialValue: "እጣ ውስጥ ይግቡና ያሸንፉ",
    }),
    defineField({
      name: "ctaTextTi",
      title: "Call To Action Button Text (Tigrinya - ትግርኛ)",
      type: "string",
      initialValue: "ዕጫ ኣቲኹም ተዓወቱ",
    }),
    defineField({
      name: "order",
      title: "Display Order Priority",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "isActive",
      title: "Active (Display on Homepage Carousel)",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      badge: "badge",
      value: "estimatedValue",
      media: "image",
    },
    prepare({ title, badge, value, media }) {
      return {
        title: `[${badge || "AD"}] ${title || "Untitled Ad"}`,
        subtitle: value ? `Estimated Value: ${value}` : "Promotional Prize",
        media,
      };
    },
  },
});
