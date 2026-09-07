import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "⚙️ Site Configuration & Official Accounts",
  type: "document",
  fieldsets: [
    {
      name: "localization",
      title: "🌐 Language & Localization Settings",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "tierControls",
      title: "🎛️ Active Lottery Prices & Pool Capacities (Add, Edit, Delete, Toggle)",
      options: { collapsible: true, collapsed: false },
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
    // ─── Localization Settings ─────────────────────────────────────────
    defineField({
      name: "defaultLanguage",
      title: "Default Platform Language (Website Default)",
      type: "string",
      fieldset: "localization",
      description: "Select which language is displayed by default when visitors open the website.",
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
    // ─── Tier Controls (Manage, Add, Edit, Delete, Toggle Prices & Pools) ─
    defineField({
      name: "etbPrices",
      title: "🇪🇹 ETB Ticket Prices (Add, Edit, Delete, Toggle)",
      type: "array",
      fieldset: "tierControls",
      description: "Manage ETB ticket prices. You can add new price amounts, edit values/labels, delete tiers, or turn on/off.",
      initialValue: [
        { value: 100, label: "100", isEnabled: true },
        { value: 200, label: "200", isEnabled: true },
        { value: 500, label: "500", isEnabled: true },
        { value: 1000, label: "1,000", isEnabled: true },
      ],
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
      initialValue: [
        { value: 25, label: "25", isEnabled: true },
        { value: 50, label: "50", isEnabled: true },
        { value: 100, label: "100", isEnabled: true },
        { value: 250, label: "250", isEnabled: true },
      ],
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
      initialValue: [
        { size: 1000, label: "1K", ticketsCount: "1,000 tickets", isEnabled: true },
        { size: 2000, label: "2K", ticketsCount: "2,000 tickets", isEnabled: true },
        { size: 3000, label: "3K", ticketsCount: "3,000 tickets", isEnabled: true },
        { size: 5000, label: "5K", ticketsCount: "5,000 tickets", isEnabled: true },
      ],
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
      title: "Diaspora USD Wire / Payment Instructions (English)",
      type: "text",
      fieldset: "paymentAccounts",
      rows: 3,
      initialValue: "Contact official support via Telegram @RimnaLotteryOfficial or wire to our designated clearing bank.",
    }),
    defineField({
      name: "diasporaWireInstructionsAm",
      title: "Diaspora USD Wire / Payment Instructions (Amharic - አማርኛ)",
      type: "text",
      fieldset: "paymentAccounts",
      rows: 3,
      initialValue: "በቴሌግራም @RimnaLotteryOfficial የድጋፍ ቡድናችንን ያነጋግሩ ወይም በቀጥታ ወደ ዲያስፖራ የባንክ ሂሳባችን ያስተላልፉ።",
    }),
    defineField({
      name: "diasporaWireInstructionsTi",
      title: "Diaspora USD Wire / Payment Instructions (Tigrinya - ትግርኛ)",
      type: "text",
      fieldset: "paymentAccounts",
      rows: 3,
      initialValue: "ብቴሌግራም @RimnaLotteryOfficial ናይ ደገፍ ጉጅለና ኣዘራርቡ ወይ ቀጥታ ናብ ናይ ዲያስፖራ ባንክ ሕሳብና ኣመሓላልፉ።",
    }),
    defineField({
      name: "footerDescription",
      title: "Footer Description (English)",
      type: "text",
      rows: 2,
      initialValue: "Rimna Digital Lottery is a transparent, live-video verified digital lottery platform with direct mobile wallet payouts.",
    }),
    defineField({
      name: "footerDescriptionAm",
      title: "Footer Description (Amharic - አማርኛ)",
      type: "text",
      rows: 2,
      initialValue: "ሪምና ዲጂታል ሎተሪ ግልጽ፣ የቀጥታ ቪዲዮ ማረጋገጫ ያለው እና በቴሌብር ክፍያ የሚፈጽም የዲጂታል ሎተሪ መድረክ ነው።",
    }),
    defineField({
      name: "footerDescriptionTi",
      title: "Footer Description (Tigrinya - ትግርኛ)",
      type: "text",
      rows: 2,
      initialValue: "ሪምና ዲጂታል ሎተሪ ግልጺ፣ ናይ ቀጥታ ቪድዮ ምርግጋጽ ዘለዎን ብቴሌብር ክፍሊት ዝፍጽምን ናይ ዲጂታል ሎተሪ መድረኽ እዩ።",
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
