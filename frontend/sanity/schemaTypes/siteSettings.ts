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
    // ─── Tier Controls (Manage, Add, Edit, Delete, Toggle Prices & Pools) ─
    defineField({
      name: "etbPrices",
      title: "🇪🇹 ETB Ticket Prices (Add, Edit, Delete, Toggle)",
      type: "array",
      fieldset: "tierControls",
      description: "Manage ETB ticket prices. You can add new price amounts, edit values/labels, delete tiers, or turn on/off.",
      of: [
        {
          type: "object",
          name: "etbPriceOption",
          title: "ETB Price Option",
          fields: [
            {
              name: "value",
              title: "Price in ETB (Birr)",
              type: "number",
              validation: (Rule) => Rule.required().positive(),
            },
            {
              name: "label",
              title: "Display Label",
              type: "string",
              description: "Optional display text (e.g. '100', '200', '500', '1,000'). Defaults to price if blank.",
            },
            {
              name: "isEnabled",
              title: "Active & Clickable on Website",
              type: "boolean",
              initialValue: true,
              description: "Turn off to disable/pause on the frontend without deleting.",
            },
          ],
          preview: {
            select: {
              value: "value",
              label: "label",
              isEnabled: "isEnabled",
            },
            prepare({ value, label, isEnabled }) {
              const status = isEnabled !== false ? "🟢 Active" : "🔴 Paused / Disabled";
              return {
                title: `${label || value || 0} ETB`,
                subtitle: status,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "usdPrices",
      title: "🇺🇸 USD Diaspora Ticket Prices (Add, Edit, Delete, Toggle)",
      type: "array",
      fieldset: "tierControls",
      description: "Manage USD diaspora ticket prices ($25, $50, $100, $250, etc.). Add new amounts, edit, delete, or turn on/off.",
      of: [
        {
          type: "object",
          name: "usdPriceOption",
          title: "USD Price Option",
          fields: [
            {
              name: "value",
              title: "Price in USD ($)",
              type: "number",
              validation: (Rule) => Rule.required().positive(),
            },
            {
              name: "label",
              title: "Display Label",
              type: "string",
              description: "Optional display text (e.g. '25', '50', '100', '250'). Defaults to price if blank.",
            },
            {
              name: "isEnabled",
              title: "Active & Clickable on Website",
              type: "boolean",
              initialValue: true,
              description: "Turn off to disable/pause on the frontend without deleting.",
            },
          ],
          preview: {
            select: {
              value: "value",
              label: "label",
              isEnabled: "isEnabled",
            },
            prepare({ value, label, isEnabled }) {
              const status = isEnabled !== false ? "🟢 Active" : "🔴 Paused / Disabled";
              return {
                title: `$${label || value || 0} USD`,
                subtitle: status,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "poolSizes",
      title: "👥 Participant Pool Capacities (Add, Edit, Delete, Toggle)",
      type: "array",
      fieldset: "tierControls",
      description: "Manage lottery participant pool sizes (1K, 2K, 3K, 5K, 10K, etc.). Add new sizes, edit, delete, or turn on/off.",
      of: [
        {
          type: "object",
          name: "poolSizeOption",
          title: "Pool Capacity Option",
          fields: [
            {
              name: "size",
              title: "Total Participant Count (e.g. 1000, 2000, 3000, 5000)",
              type: "number",
              validation: (Rule) => Rule.required().positive(),
            },
            {
              name: "label",
              title: "Badge Label (e.g. '1K', '2K', '3K', '5K')",
              type: "string",
            },
            {
              name: "ticketsCount",
              title: "Tickets Count Label (e.g. '1,000 tickets')",
              type: "string",
            },
            {
              name: "isEnabled",
              title: "Active & Clickable on Website",
              type: "boolean",
              initialValue: true,
              description: "Turn off to disable/pause on the frontend without deleting.",
            },
          ],
          preview: {
            select: {
              size: "size",
              label: "label",
              ticketsCount: "ticketsCount",
              isEnabled: "isEnabled",
            },
            prepare({ size, label, ticketsCount, isEnabled }) {
              const status = isEnabled !== false ? "🟢 Active" : "🔴 Paused / Disabled";
              return {
                title: `${label || size} Pool (${(size || 0).toLocaleString()} people)`,
                subtitle: `${status} • ${ticketsCount || `${(size || 0).toLocaleString()} tickets`}`,
              };
            },
          },
        },
      ],
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
