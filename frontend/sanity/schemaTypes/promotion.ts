import { defineField, defineType } from "sanity";

export const promotionType = defineType({
  name: "promotion",
  title: "Promotions & Events",
  type: "document",
  fieldsets: [
    { name: "general", title: "⚡ Basic Promo Info", options: { collapsible: true, collapsed: false } },
    { name: "multilingual", title: "🌍 Multilingual Translations", options: { collapsible: true, collapsed: true } },
    { name: "sponsor", title: "🤝 Sponsor & Partner Branding", options: { collapsible: true, collapsed: true } },
    { name: "settings", title: "🎨 Theme, Colors & Ordering", options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Promo Headline (English)",
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
      description: "Suggestions: HOT EVENT · LIMITED TIME | 2X ENTRY BONUS | PARTNER REWARD | NEW DRAW OPEN",
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
      title: "CTA Button Text",
      type: "string",
      placeholder: "Enter Active Draw",
      description: "Suggestions: Enter Active Draw | View Jackpots | Verify Fairness | Claim Bonus",
      fieldset: "general",
      initialValue: "Enter Active Draw",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Target Link",
      type: "string",
      placeholder: "/enter",
      description: "Suggestions: /enter | /results | /#draws-catalog",
      fieldset: "general",
      initialValue: "/enter",
      validation: (Rule) => Rule.required(),
    }),

    // Multilingual Translations
    defineField({
      name: "titleAm",
      title: "Headline (Amharic / አማርኛ)",
      type: "string",
      placeholder: "የበዓል ልዩ ቦነስ · እጥፍ እድል",
      fieldset: "multilingual",
    }),
    defineField({
      name: "titleOm",
      title: "Headline (Afaan Oromoo)",
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

    // Sponsor Branding
    defineField({
      name: "isSponsored",
      title: "Sponsored / Partner Program?",
      type: "boolean",
      initialValue: false,
      fieldset: "sponsor",
    }),
    defineField({
      name: "sponsorName",
      title: "Sponsor / Partner Name",
      type: "string",
      placeholder: "Telebirr Powered / Commercial Bank of Ethiopia / Awash Bank",
      fieldset: "sponsor",
    }),
    defineField({
      name: "sponsorLogo",
      title: "Sponsor Logo Asset",
      type: "image",
      fieldset: "sponsor",
    }),
    defineField({
      name: "bannerImage",
      title: "Background Banner Image",
      type: "image",
      fieldset: "sponsor",
      options: { hotspot: true },
    }),

    // Display & Styling Settings
    defineField({
      name: "isActive",
      title: "Active (Published on Homepage)",
      type: "boolean",
      initialValue: true,
      fieldset: "settings",
    }),
    defineField({
      name: "priority",
      title: "Display Priority Order",
      type: "number",
      description: "1 = Appears First",
      initialValue: 1,
      fieldset: "settings",
    }),
    defineField({
      name: "highlightColor",
      title: "Theme Accent Color",
      type: "string",
      description: "Type any hex/color or pick: Gold (#D4AF37), Emerald (#2BB694), Coral (#E76852), Blue (#3B82F6)",
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
