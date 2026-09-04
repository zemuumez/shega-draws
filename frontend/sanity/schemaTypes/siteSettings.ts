import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "⚙️ Site Configuration & Official Accounts",
  type: "document",
  fieldsets: [
    {
      name: "tierControls",
      title: "🎛️ Active Lottery Prices & Pool Capacities (Enable / Disable)",
      options: { collapsible: false },
    },
    {
      name: "branding",
      title: "🎨 Official Branding & Banners",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "contacts",
      title: "📞 24/7 Hotline & Social Channels",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "paymentAccounts",
      title: "💳 Official Bank & Telebirr Payment Accounts",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    // ─── Tier Controls (Turn on/off prices and pool sizes) ─────────────
    defineField({
      name: "enable100Etb",
      title: "🟢 100 ETB Ticket Price Option",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the 100 ETB button is disabled and non-clickable on the website.",
    }),
    defineField({
      name: "enable200Etb",
      title: "🟢 200 ETB Ticket Price Option",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the 200 ETB button is disabled and non-clickable on the website.",
    }),
    defineField({
      name: "enable500Etb",
      title: "🟢 500 ETB Ticket Price Option",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the 500 ETB button is disabled and non-clickable on the website.",
    }),
    defineField({
      name: "enable1000Etb",
      title: "🟢 1,000 ETB Ticket Price Option",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the 1,000 ETB button is disabled and non-clickable on the website.",
    }),
    defineField({
      name: "enable50Usd",
      title: "🟢 $50 USD Diaspora Ticket Price Option",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the $50 USD button is disabled and non-clickable on the website.",
    }),

    defineField({
      name: "enable1kPool",
      title: "👥 1,000 People (1K) Pool Capacity",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the 1K participant pool button is disabled and non-clickable on the website.",
    }),
    defineField({
      name: "enable2kPool",
      title: "👥 2,000 People (2K) Pool Capacity",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the 2K participant pool button is disabled and non-clickable on the website.",
    }),
    defineField({
      name: "enable3kPool",
      title: "👥 3,000 People (3K) Pool Capacity",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the 3K participant pool button is disabled and non-clickable on the website.",
    }),
    defineField({
      name: "enable5kPool",
      title: "👥 5,000 People (5K) Pool Capacity",
      type: "boolean",
      fieldset: "tierControls",
      initialValue: true,
      description: "When turned off, the 5K participant pool button is disabled and non-clickable on the website.",
    }),

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
      initialValue: "Contact official support via Telegram @RimnaLotteryOfficial or wire to our designated clearing bank.",
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
