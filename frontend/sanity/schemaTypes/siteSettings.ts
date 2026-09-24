import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "⚙️ Website Content & Language",
  type: "document",
  fieldsets: [
    {
      name: "localization",
      title: "🌐 Language & Localization Settings",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "branding",
      title: "🎨 Official Branding & Logo",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "pageBanners",
      title: "🖼️ Hero & Background Banners (Per-Page Customization)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contacts",
      title: "📞 24/7 Hotline, Customer Support & Telegram (Header & Footer)",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [

    // ─── Localization & Default Preferences ────────────────────────────
    defineField({
      name: "defaultLanguage",
      title: "Default Platform Language (Website Default)",
      type: "string",
      fieldset: "localization",
      description: "Publish to apply this language when visitors next load the website. Changing the default resets older saved language choices; visitors can still switch languages.",
      options: {
        list: [
          { title: "🇬🇧 English (en)", value: "en" },
          { title: "🇪🇹 አማርኛ / Amharic (am)", value: "am" },
          { title: "🇪🇹 ትግርኛ / Tigrinya (ti)", value: "ti" },
        ],
        layout: "radio",
      },
      initialValue: "en",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "defaultCurrency",
      title: "Default Platform Currency (Website Default)",
      type: "string",
      fieldset: "localization",
      description: "Select which currency (ETB or USD) is pre-selected by default on the homepage ticket configurator and hero countdown.",
      options: {
        list: [
          { title: "🇪🇹 Ethiopian Birr (ETB)", value: "ETB" },
          { title: "🇺🇸 US Dollar (USD)", value: "USD" },
        ],
        layout: "radio",
      },
      initialValue: "ETB",
      validation: (Rule) => Rule.required(),
    }),
    // ─── Branding ────────────────────────────────────────────────────
    defineField({
      name: "siteName",
      title: "Official Platform Name (English)",
      type: "string",
      fieldset: "branding",
      initialValue: "Rimna International Digital Lottery",
    }),
    defineField({
      name: "siteNameAm",
      title: "Official Platform Name (Amharic - አማርኛ)",
      type: "string",
      fieldset: "branding",
      initialValue: "ሪምና ዓለም አቀፍ ዲጂታል ሎተሪ",
    }),
    defineField({
      name: "siteNameTi",
      title: "Official Platform Name (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "branding",
      initialValue: "ሪምና ዓለም ለኸ ዲጂታል ሎተሪ",
    }),
    defineField({
      name: "tagline",
      title: "Official Tagline (English)",
      type: "string",
      fieldset: "branding",
      initialValue: "Provably Fair Digital Lottery & Guaranteed Live Public Draws",
    }),
    defineField({
      name: "taglineAm",
      title: "Official Tagline (Amharic - አማርኛ)",
      type: "string",
      fieldset: "branding",
      initialValue: "ፍትሃዊ ዲጂታል ሎተሪ እና የቀጥታ ቪዲዮ እጣ ማውጣት",
    }),
    defineField({
      name: "taglineTi",
      title: "Official Tagline (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "branding",
      initialValue: "ፍትሓዊ ዲጂታል ሎተሪን ናይ ቀጥታ ቪድዮ ዕጫ ምውጻእን",
    }),
    defineField({
      name: "logoImage",
      title: "Official Logo / Emblem Image",
      type: "image",
      fieldset: "branding",
      options: { hotspot: true },
      description: "Platform official logo displayed in the top navbar and footer.",
    }),

    // ─── Hero & Page Background Banners (Per-Page Customization) ────────
    defineField({
      name: "heroBannerImage",
      title: "🏠 Homepage Panoramic Hero Banner Image",
      type: "image",
      fieldset: "pageBanners",
      options: { hotspot: true },
      description: "Official panoramic background banner for the Homepage countdown & ticket selection hero. Also serves as global fallback for other pages if unset.",
    }),
    defineField({
      name: "howItWorksHeroBannerImage",
      title: "📖 How It Works Page Hero Banner Image",
      type: "image",
      fieldset: "pageBanners",
      options: { hotspot: true },
      description: "Custom hero background banner displayed on the /how-it-works complete player guide page.",
    }),
    defineField({
      name: "resultsHeroBannerImage",
      title: "🏆 Results & Broadcast Page Hero Banner Image",
      type: "image",
      fieldset: "pageBanners",
      options: { hotspot: true },
      description: "Custom hero background banner displayed on the /results live stream & winner announcement page.",
    }),
    defineField({
      name: "entriesHeroBannerImage",
      title: "🎟️ My Tickets / Player Entries Page Hero Banner Image",
      type: "image",
      fieldset: "pageBanners",
      options: { hotspot: true },
      description: "Custom hero background banner displayed on the /entries user ticket dashboard.",
    }),
    defineField({
      name: "aboutHeroBannerImage",
      title: "💎 Why Rimna (About Us) Page Hero Banner Image",
      type: "image",
      fieldset: "pageBanners",
      options: { hotspot: true },
      description: "Custom hero background banner displayed on the /about company transparency & founders mission page.",
    }),

    // ─── Contacts & Customer Support (Header & Footer) ───────────────
    defineField({
      name: "contactPhone",
      title: "📞 24/7 Primary Support & Hotline Phone",
      type: "string",
      fieldset: "contacts",
      initialValue: "+251 911 000 000",
      description: "Primary support hotline phone number displayed in the footer, top nav, and result pages.",
    }),
    defineField({
      name: "contactPhoneSecondary",
      title: "📞 24/7 Secondary Support & Hotline Phone",
      type: "string",
      fieldset: "contacts",
      initialValue: "+251 920 000 000",
      description: "Secondary / backup support hotline phone number displayed in the footer.",
    }),
    defineField({
      name: "supportEmail",
      title: "✉️ Primary Customer Support Email",
      type: "string",
      fieldset: "contacts",
      initialValue: "support@rimnalottery.com",
      description: "Official customer support email address displayed in the footer.",
    }),
    defineField({
      name: "supportEmailSecondary",
      title: "✉️ Secondary Customer Support Email (Optional)",
      type: "string",
      fieldset: "contacts",
      description: "Optional secondary / inquiries email address for the footer.",
    }),
    defineField({
      name: "telegramHandle",
      title: "✈️ Official Telegram Channel / Handle",
      type: "string",
      fieldset: "contacts",
      initialValue: "@RimnaLotteryOfficial",
      description: "Official Telegram channel handle (e.g. @RimnaLotteryOfficial) displayed in the footer and top bar.",
    }),
    defineField({
      name: "telegramUrl",
      title: "🔗 Official Telegram Direct Link URL",
      type: "url",
      fieldset: "contacts",
      initialValue: "https://t.me/RimnaLotteryOfficial",
      description: "Direct URL to the official Telegram channel or support bot.",
    }),


  ],
  preview: {
    select: {
      siteName: "siteName",
      contactPhone: "contactPhone",
    },
    prepare({ siteName, contactPhone }) {
      return {
        title: siteName || "Site Settings",
        subtitle: `Hotline: ${contactPhone || "+251 911 000 000"}`,
      };
    },
  },
});
