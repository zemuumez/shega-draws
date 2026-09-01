import { defineField, defineType } from "sanity";

export const drawType = defineType({
  name: "draw",
  title: "🎰 Active Draws & Countdown",
  type: "document",
  fields: [
    defineField({
      name: "drawId",
      title: "Draw Reference Code",
      type: "string",
      placeholder: "e.g. RDL-ETB-500-2K",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Draw Title",
      type: "string",
      placeholder: "e.g. 500 Birr Grand Multi-Pool Draw",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "currency",
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
      title: "Ticket Price",
      type: "number",
      initialValue: 100,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "poolCapacity",
      title: "Pool Capacity (Tickets)",
      type: "number",
      options: {
        list: [
          { title: "1,000 People (1K)", value: 1000 },
          { title: "2,000 People (2K)", value: 2000 },
          { title: "3,000 People (3K)", value: 3000 },
          { title: "5,000 People (5K)", value: 5000 },
        ],
      },
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
