import { defineArrayMember, defineField, defineType } from "sanity";

export const drawType = defineType({
  name: "draw",
  title: "Draws & Jackpots",
  type: "document",
  fieldsets: [
    { name: "general", title: "General Information", options: { collapsible: true, collapsed: false } },
    { name: "multilingual", title: "Ethiopian Localization (Amharic & Afaan Oromoo)", options: { collapsible: true, collapsed: true } },
    { name: "economics", title: "Economics & Pricing", options: { collapsible: true, collapsed: false } },
    { name: "crypto", title: "Cryptographic Fairness & Audit", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "drawId",
      title: "Draw Reference ID",
      type: "string",
      description: "Unique draw identifier matching backend records (e.g. PD-2026-08A)",
      fieldset: "general",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Draw Title (English)",
      type: "string",
      placeholder: "Grand Meskel & Ethiopian Holiday Jackpot",
      fieldset: "general",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      fieldset: "general",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Draw Status",
      type: "string",
      fieldset: "general",
      options: {
        list: [
          { title: "🟢 Open (Accepting Entries)", value: "open" },
          { title: "🟡 Upcoming (Preview Mode)", value: "upcoming" },
          { title: "🔒 Closed (Draw in Progress)", value: "closed" },
          { title: "🏆 Revealed (Results Published)", value: "revealed" },
        ],
        layout: "radio",
      },
      initialValue: "open",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "deadline",
      title: "Entry Cutoff / Draw Date",
      type: "datetime",
      fieldset: "general",
      description: "Date and time when ticket purchases stop and the draw takes place",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (English)",
      type: "text",
      rows: 3,
      fieldset: "general",
      placeholder: "Pick a number from 00 to 99, deposit your entry, and verify the cryptographic seed on draw day.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Banner Image",
      type: "image",
      fieldset: "general",
      options: { hotspot: true },
    }),

    // Multilingual Localizations
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
      placeholder: "ከ 00 እስከ 99 የሚወዱትን ቁጥር ይምረጡ፣ በቴሌብር ይክፈሉ፣ በእጣው ቀን የማረጋገጫ ኮዱን ያረጋግጡ።",
    }),
    defineField({
      name: "descriptionOm",
      title: "Description (Afaan Oromoo)",
      type: "text",
      rows: 3,
      fieldset: "multilingual",
      placeholder: "Lakkoofsa 00 hanga 99 filadhaa, Telebirr kaffalaa, ragaa qulqullummaa mirkaneeffadhaa.",
    }),

    // Economics & Limits
    defineField({
      name: "ticketPrice",
      title: "Base Ticket Price (ETB)",
      type: "number",
      fieldset: "economics",
      initialValue: 100,
      validation: (Rule) => Rule.min(10),
    }),
    defineField({
      name: "totalPrizeValue",
      title: "Total Prize Pool Value (Formatted)",
      type: "string",
      placeholder: "ETB 25,000,000+",
      fieldset: "economics",
    }),
    defineField({
      name: "maxNumber",
      title: "Max Selectable Number",
      type: "number",
      fieldset: "economics",
      description: "Default is 99 (00-99 grid = 100 numbers)",
      initialValue: 99,
    }),
    defineField({
      name: "entryAmounts",
      title: "Selectable Entry Amounts (ETB)",
      type: "array",
      of: [defineArrayMember({ type: "number" })],
      fieldset: "economics",
      initialValue: [50, 100, 250, 500, 1000],
    }),

    // Prizes list
    defineField({
      name: "prizes",
      title: "Prize Tiers",
      type: "array",
      of: [defineArrayMember({ type: "prize" })],
      description: "List of prizes for this draw in order of rank (1st, 2nd, 3rd...)",
    }),

    // Payment Methods
    defineField({
      name: "paymentMethods",
      title: "Accepted Payment Accounts",
      type: "array",
      of: [defineArrayMember({ type: "paymentMethod" })],
    }),

    // Cryptographic & Fairness fields
    defineField({
      name: "commitment",
      title: "SHA-256 Seed Commitment Hash",
      type: "string",
      fieldset: "crypto",
      description: "Pre-committed cryptographic hash published prior to draw opening",
    }),
    defineField({
      name: "seed",
      title: "Revealed Secret Seed",
      type: "string",
      fieldset: "crypto",
      description: "Secret seed published after draw closes to deterministically compute winners",
    }),
    defineField({
      name: "winningNumbers",
      title: "Winning Numbers List",
      type: "array",
      fieldset: "crypto",
      of: [defineArrayMember({ type: "string" })],
      description: "Derived winning numbers (e.g. ['42', '07', '89'])",
    }),
  ],
  preview: {
    select: {
      title: "title",
      drawId: "drawId",
      status: "status",
      media: "heroImage",
    },
    prepare({ title, drawId, status, media }) {
      const statusIcon = status === "open" ? "🟢" : status === "closed" ? "🔒" : status === "revealed" ? "🏆" : "🟡";
      return {
        title: title || "Untitled Draw",
        subtitle: `${statusIcon} ${drawId ?? "No ID"} · Status: ${status ?? "open"}`,
        media,
      };
    },
  },
});
