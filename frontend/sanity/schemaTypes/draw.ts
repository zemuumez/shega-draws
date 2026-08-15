import { defineArrayMember, defineField, defineType } from "sanity";

export const drawType = defineType({
  name: "draw",
  title: "Draws & Jackpots",
  type: "document",
  fieldsets: [
    {
      name: "quickSetup",
      title: "⚡ Quick Setup & Basic Info",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "multilingual",
      title: "🌍 Ethiopian Translations (Amharic & Afaan Oromoo)",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "economics",
      title: "💰 Economics, Pricing & Ticket Limits",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "prizesGroup",
      title: "🏆 Prize Tiers & Showcase",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "crypto",
      title: "🔐 Cryptographic Fairness & Audit",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "drawId",
      title: "Draw Reference ID",
      type: "string",
      description: "Unique code matching backend records (e.g. PD-2026-08A, MESKEL-2026, NY-MEGA-01)",
      fieldset: "quickSetup",
      placeholder: "PD-2026-08A",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Draw Title (English)",
      type: "string",
      description: "Enter a custom title or choose inspiration: Grand Meskel & Holiday Jackpot, Addis New Year Mega Raffle, Weekly Community Draw",
      placeholder: "Grand Meskel & Holiday Jackpot",
      fieldset: "quickSetup",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      fieldset: "quickSetup",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Current Status",
      type: "string",
      fieldset: "quickSetup",
      options: {
        list: [
          { title: "🟢 Open (Currently Accepting Entries & Payments)", value: "open" },
          { title: "🟡 Upcoming (Scheduled / Preview Mode)", value: "upcoming" },
          { title: "🔒 Closed (Entries Locked · Running Draw)", value: "closed" },
          { title: "🏆 Revealed (Results Published & Verifiable)", value: "revealed" },
        ],
        layout: "radio",
      },
      initialValue: "open",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "deadline",
      title: "Entry Cutoff & Draw Date",
      type: "datetime",
      fieldset: "quickSetup",
      description: "When ticket sales close and the winning seed is published",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (English)",
      type: "text",
      rows: 3,
      fieldset: "quickSetup",
      placeholder: "Pick your lucky number (00–99), pay conveniently via Telebirr or CBE Birr, and verify the cryptographic seed on draw day.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Banner Image",
      type: "image",
      fieldset: "quickSetup",
      options: { hotspot: true },
    }),

    // ─── Ethiopian Multilingual Localizations ─────────────────────────
    defineField({
      name: "titleAm",
      title: "Draw Title (Amharic / አማርኛ)",
      type: "string",
      placeholder: "ታላቁ የመስቀል እና የበዓል ጃክፖት",
      fieldset: "multilingual",
    }),
    defineField({
      name: "titleOm",
      title: "Draw Title (Afaan Oromoo)",
      type: "string",
      placeholder: "Badhaasa Guddaa Ayyaana Masqalaa",
      fieldset: "multilingual",
    }),
    defineField({
      name: "descriptionAm",
      title: "Description (Amharic / አማርኛ)",
      type: "text",
      rows: 3,
      fieldset: "multilingual",
      placeholder: "ከ 00 እስከ 99 የሚወዱትን ቁጥር ይምረጡ፣ በቴሌብር ወይም በንግድ ባንክ ይክፈሉ፣ በእጣው ቀን የማረጋገጫ ኮዱን ያረጋግጡ።",
    }),
    defineField({
      name: "descriptionOm",
      title: "Description (Afaan Oromoo)",
      type: "text",
      rows: 3,
      fieldset: "multilingual",
      placeholder: "Lakkoofsa 00 hanga 99 filadhaa, Telebirr ykn Baankii Daldalaan kaffalaa, guyyaa carraatti koodii qulqullummaa mirkaneeffadhaa.",
    }),

    // ─── Economics & Limits ──────────────────────────────────────────
    defineField({
      name: "ticketPrice",
      title: "Base Ticket Price (ETB)",
      type: "number",
      fieldset: "economics",
      description: "Common prices: 50, 100, 200, 500, 1000 ETB (or any custom amount)",
      initialValue: 100,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "totalPrizeValue",
      title: "Total Prize Pool Value (Display String)",
      type: "string",
      description: "e.g. ETB 25,000,000+ or ETB 10,000,000",
      placeholder: "ETB 25,000,000+",
      fieldset: "economics",
    }),
    defineField({
      name: "maxNumber",
      title: "Max Selectable Ticket Number",
      type: "number",
      fieldset: "economics",
      description: "Set 99 for 00–99 (100 numbers), 49 for 00–49 (50 numbers), 999 for 3-digit numbers, or custom.",
      initialValue: 99,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "entryAmounts",
      title: "Quick-Select Entry Quantities / Multipliers (ETB)",
      type: "array",
      of: [defineArrayMember({ type: "number" })],
      fieldset: "economics",
      initialValue: [50, 100, 250, 500, 1000],
    }),

    // ─── Prizes Group ────────────────────────────────────────────────
    defineField({
      name: "prizes",
      title: "Prize Tiers List",
      type: "array",
      fieldset: "prizesGroup",
      of: [defineArrayMember({ type: "prize" })],
      description: "Add prize positions (1st Grand Jackpot, 2nd EV Car, 3rd Tech, 4th–10th Cash)",
    }),
    defineField({
      name: "paymentMethods",
      title: "Accepted Payment Accounts",
      type: "array",
      fieldset: "quickSetup",
      of: [defineArrayMember({ type: "paymentMethod" })],
      description: "Bank & Mobile Money accounts (Telebirr, CBE Birr, Awash Bank, etc.)",
    }),

    // ─── Cryptographic Fairness ──────────────────────────────────────
    defineField({
      name: "commitment",
      title: "Pre-committed SHA-256 Hash",
      type: "string",
      fieldset: "crypto",
      description: "Commitment hash published prior to ticket sales",
      placeholder: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    }),
    defineField({
      name: "seed",
      title: "Revealed Secret Seed",
      type: "string",
      fieldset: "crypto",
      description: "Published after draw closes to deterministically compute winners",
    }),
    defineField({
      name: "winningNumbers",
      title: "Derived Winning Numbers",
      type: "array",
      fieldset: "crypto",
      of: [defineArrayMember({ type: "string" })],
      description: "e.g. ['42', '07', '89']",
    }),
  ],
  preview: {
    select: {
      title: "title",
      drawId: "drawId",
      status: "status",
      prizeValue: "totalPrizeValue",
      media: "heroImage",
    },
    prepare({ title, drawId, status, prizeValue, media }) {
      const statusIcon = status === "open" ? "🟢" : status === "closed" ? "🔒" : status === "revealed" ? "🏆" : "🟡";
      return {
        title: title || "Untitled Draw",
        subtitle: `${statusIcon} [${drawId ?? "No ID"}] · ${prizeValue ?? "Prize Pool"} · Status: ${status ?? "open"}`,
        media,
      };
    },
  },
});
