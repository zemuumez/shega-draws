import { defineField, defineType } from "sanity";

export const promotionType = defineType({
  name: "promotion",
  title: "Promotions & Events",
  type: "document",
  fieldsets: [
    { name: "general", title: "General Info", options: { collapsible: true, collapsed: false } },
    { name: "multilingual", title: "Multilingual Localizations", options: { collapsible: true, collapsed: true } },
    { name: "sponsor", title: "Sponsor & Partner Branding", options: { collapsible: true, collapsed: true } },
    { name: "settings", title: "Display & Timing Settings", options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Promo Title (English)",
      type: "string",
      placeholder: "Grand Holiday Special · Double Entry Bonus",
      fieldset: "general",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "badge",
      title: "Badge Text (English)",
      type: "string",
      placeholder: "HOT EVENT · LIMITED TIME",
      fieldset: "general",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (English)",
      type: "text",
      rows: 2,
      placeholder: "Enter before Friday midnight to receive automated entry into our weekly mini-jackpot!",
      fieldset: "general",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ctaText",
      title: "Call-to-Action Button Text",
      type: "string",
      placeholder: "Enter Draw Now",
      fieldset: "general",
      initialValue: "Enter Draw Now",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ctaLink",
      title: "Call-to-Action Link Target",
      type: "string",
      placeholder: "/enter",
      fieldset: "general",
      initialValue: "/enter",
      validation: (Rule) => Rule.required(),
    }),

    // Multilingual Localizations
    defineField({
      name: "titleAm",
      title: "Promo Title (Amharic / አማርኛ)",
      type: "string",
      placeholder: "የበዓል ልዩ ቦነስ · እጥፍ እድል",
      fieldset: "multilingual",
    }),
    defineField({
      name: "titleOm",
      title: "Promo Title (Afaan Oromoo)",
      type: "string",
      placeholder: "Badhaasa Addaa Ayyaanaa",
      fieldset: "multilingual",
    }),
    defineField({
      name: "badgeAm",
      title: "Badge (Amharic / አማርኛ)",
      type: "string",
      placeholder: "ልዩ ቅናሽ · የፈጠነ ያገኛል",
      fieldset: "multilingual",
    }),
    defineField({
      name: "badgeOm",
      title: "Badge (Afaan Oromoo)",
      type: "string",
      placeholder: "Carraa Addaa",
      fieldset: "multilingual",
    }),
    defineField({
      name: "descriptionAm",
      title: "Description (Amharic / አማርኛ)",
      type: "text",
      rows: 2,
      placeholder: "እስከ አርብ እኩለ ሌሊት ድረስ ቲኬት ይቁረጡ እና የሳምንቱን ልዩ ቦነስ ያሸንፉ!",
      fieldset: "multilingual",
    }),
    defineField({
      name: "descriptionOm",
      title: "Description (Afaan Oromoo)",
      type: "text",
      rows: 2,
      placeholder: "Hanga Jimaataatti galmaa'aa badhaasa addaa argadhaa!",
      fieldset: "multilingual",
    }),

    // Sponsor & Branding
    defineField({
      name: "isSponsored",
      title: "Is Sponsored / Partner Campaign?",
      type: "boolean",
      initialValue: false,
      fieldset: "sponsor",
    }),
    defineField({
      name: "sponsorName",
      title: "Sponsor Brand Name",
      type: "string",
      placeholder: "Telebirr / Ethiopian Airlines / Dashen Bank",
      fieldset: "sponsor",
    }),
    defineField({
      name: "sponsorLogo",
      title: "Sponsor Logo",
      type: "image",
      fieldset: "sponsor",
    }),
    defineField({
      name: "bannerImage",
      title: "Banner Background Image",
      type: "image",
      fieldset: "sponsor",
      options: { hotspot: true },
    }),

    // Settings
    defineField({
      name: "isActive",
      title: "Active / Published",
      type: "boolean",
      initialValue: true,
      fieldset: "settings",
    }),
    defineField({
      name: "priority",
      title: "Priority Ordering",
      type: "number",
      description: "Lower number appears first (1 = highest priority)",
      initialValue: 1,
      fieldset: "settings",
    }),
    defineField({
      name: "highlightColor",
      title: "Accent / Glow Color",
      type: "string",
      description: "CSS color or hex (e.g. #D4AF37 for Gold, #00BFA5 for Teal, #FF6F61 for Coral)",
      initialValue: "#D4AF37",
      fieldset: "settings",
    }),
    defineField({
      name: "validUntil",
      title: "Expiration / Countdown Target",
      type: "datetime",
      fieldset: "settings",
    }),
  ],
  preview: {
    select: {
      title: "title",
      badge: "badge",
      isActive: "isActive",
      media: "bannerImage",
    },
    prepare({ title, badge, isActive, media }) {
      return {
        title: title || "Untitled Promotion",
        subtitle: `${isActive ? "🟢 Active" : "⚪ Draft"} · [${badge ?? "Promo"}]`,
        media,
      };
    },
  },
});
