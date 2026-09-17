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
    {
      name: "paymentAccounts",
      title: "💳 Official Bank & Telebirr Payment Accounts",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({name: "lastEntryAt", type: "datetime", hidden: true, readOnly: true}),

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
              validation: (Rule) => Rule.required().integer().min(1).max(100000),
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

    // ─── Payment Accounts (Telebirr, CBE & International IBAN) ──────
    defineField({
      name: "telebirrReceiverPhone",
      title: "📱 Telebirr Recipient Phone Number",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "+251 911 000 000",
      description: "Official phone number players transfer to when paying via Telebirr.",
    }),
    defineField({
      name: "telebirrMerchantCode",
      title: "🏪 Telebirr Merchant Code / Shortcode",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "884729",
      description: "Official shortcode / merchant code displayed to players for Telebirr pay-way.",
    }),
    defineField({
      name: "telebirrAccountName",
      title: "👤 Telebirr Recipient Account Name",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "Rimna International Digital Lottery PLC",
      description: "Official name shown to confirm Telebirr transfer recipient.",
    }),

    defineField({
      name: "cbeBankName",
      title: "🏦 Domestic Bank Name",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "Commercial Bank of Ethiopia (CBE)",
    }),
    defineField({
      name: "cbeAccountNumber",
      title: "💳 CBE Account Number",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "1000 1234 5678",
      description: "Official CBE bank account number for ticket deposits.",
    }),
    defineField({
      name: "cbeAccountName",
      title: "👤 CBE Account Holder Name",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "Rimna International Digital Lottery PLC",
    }),

    defineField({
      name: "diasporaBankName",
      title: "🏦 Recipient Bank Name (USD / International)",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "Commercial Bank of Ethiopia (International & Diaspora Banking)",
    }),
    defineField({
      name: "diasporaIban",
      title: "🌐 IBAN / International Account Number",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "ET64CBET000100012345678",
      description: "International Bank Account Number (IBAN) for USD remittance.",
    }),
    defineField({
      name: "diasporaAccountName",
      title: "👤 Recipient / Account Holder Name (USD)",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "Rimna International Digital Lottery PLC",
    }),
    defineField({
      name: "diasporaSwiftBic",
      title: "⚡ SWIFT / BIC Code (Optional)",
      type: "string",
      fieldset: "paymentAccounts",
      initialValue: "CBETETAA",
    }),
    defineField({
      name: "diasporaWireInstructions",
      title: "Diaspora USD Wire / Payment Instructions (English)",
      type: "text",
      fieldset: "paymentAccounts",
      rows: 3,
      initialValue: "Send USD remittance via Western Union, Remitly, or wire transfer using the recipient IBAN and name above.",
    }),
    defineField({
      name: "diasporaWireInstructionsAm",
      title: "Diaspora USD Wire / Payment Instructions (Amharic - አማርኛ)",
      type: "text",
      fieldset: "paymentAccounts",
      rows: 3,
      initialValue: "ከላይ በተጠቀሰው የIBAN ቁጥር እና የስም ዝርዝር በዌስተርን ዩኒየን፣ በሬሚትሊ ወይም በቀጥታ የባንክ ዝውውር ይክፈሉ።",
    }),
    defineField({
      name: "diasporaWireInstructionsTi",
      title: "Diaspora USD Wire / Payment Instructions (Tigrinya - ትግርኛ)",
      type: "text",
      fieldset: "paymentAccounts",
      rows: 3,
      initialValue: "ኣብ ላዕሊ ብዝተጠቕሰ ናይ IBAN ቁጽርን ሽምን ብዌስተርን ዩንየን፣ ሬሚትሊ ወይ ቀጥታ ናይ ባንክ ዝውውር ክፈሉ።",
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
