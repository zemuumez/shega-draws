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
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "footer",
      title: "📑 Footer Content & Trilingual Customization",
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

    // ─── Footer Trilingual Customization ──────────────────────────────
    defineField({
      name: "footerDescription",
      title: "Footer Description (English)",
      type: "text",
      fieldset: "footer",
      rows: 2,
      initialValue: "Rimna Digital Lottery is a transparent, live-video verified digital lottery platform with direct mobile wallet payouts.",
    }),
    defineField({
      name: "footerDescriptionAm",
      title: "Footer Description (Amharic - አማርኛ)",
      type: "text",
      fieldset: "footer",
      rows: 2,
      initialValue: "ሪምና ዲጂታል ሎተሪ ግልጽ፣ የቀጥታ ቪዲዮ ማረጋገጫ ያለው እና በቴሌብር ክፍያ የሚፈጽም የዲጂታል ሎተሪ መድረክ ነው።",
    }),
    defineField({
      name: "footerDescriptionTi",
      title: "Footer Description (Tigrinya - ትግርኛ)",
      type: "text",
      fieldset: "footer",
      rows: 2,
      initialValue: "ሪምና ዲጂታል ሎተሪ ግልጺ፣ ናይ ቀጥታ ቪድዮ ምርግጋጽ ዘለዎን ብቴሌብር ክፍሊት ዝፍጽምን ናይ ዲጂታል ሎተሪ መድረኽ እዩ።",
    }),
    defineField({
      name: "footerQuickLinksTitle",
      title: "Quick Links Title (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "Platform Navigation",
    }),
    defineField({
      name: "footerQuickLinksTitleAm",
      title: "Quick Links Title (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "ፈጣን አገናኞች",
    }),
    defineField({
      name: "footerQuickLinksTitleTi",
      title: "Quick Links Title (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "ቕልጡፍ መላግቦታት",
    }),
    defineField({
      name: "footerPoolTransparencyTitle",
      title: "Pool Sizes & Transparency Title (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "Pool Sizes & Transparency",
    }),
    defineField({
      name: "footerPoolTransparencyTitleAm",
      title: "Pool Sizes & Transparency Title (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "የእጣ መጠን እና ግልጸኝነት",
    }),
    defineField({
      name: "footerPoolTransparencyTitleTi",
      title: "Pool Sizes & Transparency Title (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "መጠንን ግልጽነትን ዕጫታት",
    }),
    defineField({
      name: "footerFeature1",
      title: "Pool Feature 1 (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "1K, 2K, 3K, and 5K Ticket Capacities",
    }),
    defineField({
      name: "footerFeature1Am",
      title: "Pool Feature 1 (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "1ሺህ፣ 2ሺህ፣ 3ሺህ እና 5ሺህ የቲኬት አቅም",
    }),
    defineField({
      name: "footerFeature1Ti",
      title: "Pool Feature 1 (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "1ሺሕ፣ 2ሺሕ፣ 3ሺሕን 5ሺሕን ናይ ቲኬት ዓቕሚ",
    }),
    defineField({
      name: "footerFeature2",
      title: "Pool Feature 2 (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "100% Live Video Broadcast Draws",
    }),
    defineField({
      name: "footerFeature2Am",
      title: "Pool Feature 2 (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "100% የቀጥታ ቪዲዮ እጣ ማውጣት",
    }),
    defineField({
      name: "footerFeature2Ti",
      title: "Pool Feature 2 (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "100% ናይ ቀጥታ ቪድዮ ዕጫ ምውጻእ",
    }),
    defineField({
      name: "footerFeature3",
      title: "Pool Feature 3 (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "10-Tier Fixed Guaranteed Prizes",
    }),
    defineField({
      name: "footerFeature3Am",
      title: "Pool Feature 3 (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "10 ደረጃዎች ያሉት ቋሚ ሽልማቶች",
    }),
    defineField({
      name: "footerFeature3Ti",
      title: "Pool Feature 3 (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "10 ደረጃ ዘለዎም ቀወምቲ ሽልማታት",
    }),
    defineField({
      name: "footerSupportTitle",
      title: "Customer Support Title (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "Customer Support",
    }),
    defineField({
      name: "footerSupportTitleAm",
      title: "Customer Support Title (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "የደንበኞች አገልግሎት",
    }),
    defineField({
      name: "footerSupportTitleTi",
      title: "Customer Support Title (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "ናይ ዓማዊል ደገፍ",
    }),
    defineField({
      name: "footerTelegramLabel",
      title: "Official Telegram Label (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "Official Telegram:",
    }),
    defineField({
      name: "footerTelegramLabelAm",
      title: "Official Telegram Label (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "ኦፊሴላዊ ቴሌግራም፦",
    }),
    defineField({
      name: "footerTelegramLabelTi",
      title: "Official Telegram Label (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "ወግዓዊ ቴሌግራም፦",
    }),
    defineField({
      name: "copyrightText",
      title: "Copyright Text (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "All rights reserved. Rimna International Digital Lottery PLC.",
    }),
    defineField({
      name: "copyrightTextAm",
      title: "Copyright Text (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "መብቱ በህግ የተጠበቀ ነው። ሪምና ዓለም አቀፍ ዲጂታል ሎተሪ ኃ/የተ/የግ/ማ።",
    }),
    defineField({
      name: "copyrightTextTi",
      title: "Copyright Text (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "መሰሉ ብሕጊ ዝተሓለወ እዩ። ሪምና ዓለም ለኸ ዲጂታል ሎተሪ ኃ/ዝ/ው/ማሕበር።",
    }),
    defineField({
      name: "complianceText",
      title: "Compliance / Transparency Badge Text (English)",
      type: "string",
      fieldset: "footer",
      initialValue: "Fully verified transactions · 100% Live Public Video Draws",
    }),
    defineField({
      name: "complianceTextAm",
      title: "Compliance / Transparency Badge Text (Amharic - አማርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "100% የቀጥታ ቪዲዮ ማረጋገጫ ያለው የታማኝነት አሰራር",
    }),
    defineField({
      name: "complianceTextTi",
      title: "Compliance / Transparency Badge Text (Tigrinya - ትግርኛ)",
      type: "string",
      fieldset: "footer",
      initialValue: "100% ናይ ቀጥታ ቪድዮ ምርግጋጽ ዘለዎ ተኣማኒ ኣሰራርሓ",
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
