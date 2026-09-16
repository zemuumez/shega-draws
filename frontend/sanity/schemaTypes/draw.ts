import { defineField, defineType } from "sanity";

export const drawType = defineType({
  name: "draw",
  title: "🎰 Active Draws & Countdown",
  type: "document",
  fields: [
    defineField({name: "lastEntryAt", type: "datetime", hidden: true, readOnly: true}),

    defineField({
      name: "drawId",
      readOnly: ({document}) => !!document?.lastEntryAt,
      title: "Draw Reference Code",
      type: "string",
      placeholder: "e.g. RDL-ETB-500-2K",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Draw Title (English)",
      type: "string",
      placeholder: "e.g. 500 Birr Grand Multi-Pool Draw",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleAm",
      title: "Draw Title (Amharic - አማርኛ)",
      type: "string",
      placeholder: "e.g. የ500 ብር ታላቁ የብዙ-ተሳታፊ እጣ",
    }),
    defineField({
      name: "titleTi",
      title: "Draw Title (Tigrinya - ትግርኛ)",
      type: "string",
      placeholder: "e.g. ናይ 500 ብር ዓቢይ ናይ ብዙሕ-ተሳታፊ ዕጫ",
    }),
    defineField({
      name: "currency",
      readOnly: ({document}) => !!document?.lastEntryAt,
      title: "Currency",
      type: "string",
      options: {
        list: [
          { title: "ETB (Ethiopian Birr)", value: "ETB" },
          { title: "USD (US Dollars)", value: "USD" },
        ],
      },
      initialValue: "ETB",
    }),
    defineField({
      name: "ticketPrice",
      readOnly: ({document}) => !!document?.lastEntryAt,
      title: "Ticket Price",
      type: "number",
      initialValue: 100,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "poolCapacity",
      readOnly: ({document}) => !!document?.lastEntryAt,
      title: "Pool Capacity (Tickets)",
      type: "number",
      description: "Total ticket slots: 1 through this number. Add the same enabled capacity under Site Settings. A 25K pool uses 25000.",
      validation: (Rule) => Rule.required().integer().min(1).max(100000),
      initialValue: 1000,
    }),
    defineField({
      name: "status",
      title: "Draw Status",
      type: "string",
      options: {
        list: [
          { title: "🟢 Open for Ticket Sales", value: "open" },
          { title: "🔴 Closed (In Live Drawing)", value: "closed" },
          { title: "🏁 Completed (Results Published)", value: "completed" },
        ],
        layout: "radio",
      },
      initialValue: "open",
    }),
    defineField({
      name: "deadline",
      title: "Live Draw Countdown Target Date & Time",
      type: "datetime",
      description: "Controls the live ticking countdown timer displayed across the site.",
    }),
    defineField({
      name: "liveVideoUrl",
      title: "Live Broadcast Video URL (YouTube / Telegram)",
      type: "url",
      description: "Link to the founders' live stream broadcast.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      drawId: "drawId",
      price: "ticketPrice",
      currency: "currency",
      status: "status",
    },
    prepare({ title, drawId, price, currency, status }) {
      const statusIcon = status === "open" ? "🟢" : "🔴";
      return {
        title: `${statusIcon} ${title || "Untitled Draw"}`,
        subtitle: `${drawId || ""} · ${price || 100} ${currency || "ETB"} [${(status || "OPEN").toUpperCase()}]`,
      };
    },
  },
});
