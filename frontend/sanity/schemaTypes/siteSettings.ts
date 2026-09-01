import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "⚙️ Site Configuration & Official Accounts",
  type: "document",
  fieldsets: [
    {
      name: "branding",
      title: "🎨 Official Branding & Banners",
      options: { collapsible: false },
    },
    {
      name: "contacts",
      title: "📞 24/7 Hotline & Social Channels",
      options: { collapsible: false },
    },
    {
      name: "paymentAccounts",
      title: "💳 Official Bank & Telebirr Payment Accounts",
      options: { collapsible: false },
    },
  ],
  fields: [
    // ─── Branding ────────────────────────────────────────────────────
    defineField({
      name: "siteName",
      title: "Official Platform Name",
      type: "string",
      fieldset: "branding",
      initialValue: "Rimna International Digital Lottery",
    }),
    defineField({
      name: "heroBannerImage",
      title: "Official Panoramic Hero Banner Image",
      type: "image",
      fieldset: "branding",
      options: { hotspot: true },
      description: "Upload your official high-resolution wide panoramic lottery banner.",
    }),
    defineField({
      name: "logoImage",
      title: "Official Logo / Emblem Image",
      type: "image",
      fieldset: "branding",
      options: { hotspot: true },
    }),

    // ─── Contacts ────────────────────────────────────────────────────
    defineField({
      name: "contactPhone",
      title: "24/7 Official Hotline Phone",
      type: "string",
      fieldset: "contacts",
      initialValue: "+251 911 000 000",
    }),
    defineField({
      name: "telegramHandle",
      title: "Official Telegram Channel / Handle",
      type: "string",
      fieldset: "contacts",
      initialValue: "@RimnaLotteryOfficial",
    }),
    defineField({
      name: "supportEmail",
      title: "Customer Support Email",
      type: "string",
      fieldset: "contacts",
      initialValue: "support@rimnalottery.com",
    }),

    // ─── Payment Accounts ────────────────────────────────────────────
    defineField({
      name: "telebirrMerchantCode",
      title: "Telebirr Merchant Code / Shortcode",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "884729",
      description: "Displayed to players when purchasing tickets via Telebirr.",
    }),
    defineField({
      name: "cbeAccountNumber",
      title: "Commercial Bank of Ethiopia (CBE) Account Number",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "1000 1234 5678",
      description: "Official CBE bank account number for ticket deposits.",
    }),
    defineField({
      name: "cbeAccountName",
      title: "CBE Account Holder Name",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "Rimna International Digital Lottery PLC",
    }),
    defineField({
      name: "diasporaWireInstructions",
      title: "Diaspora USD Wire / Payment Instructions",
      type: "text",
      fieldset: "paymentAccounts",
      rows: 3,
      initialValue: "Send USD remittance via Western Union, Remitly, or direct wire to our official designated receiving account.",
    }),
  ],
  preview: {
    select: {
      title: "siteName",
      media: "heroBannerImage",
    },
    prepare({ title, media }) {
      return {
        title: title || "Site Configuration",
        subtitle: "Official branding, hotline & payment accounts",
        media,
      };
    },
  },
});
