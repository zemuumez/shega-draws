import { defineField, defineType } from "sanity";

export const drawResultType = defineType({
  name: "drawResult",
  title: "Draw Result & Winning Numbers",
  type: "document",
  fields: [
    defineField({
      name: "drawId",
      title: "Draw Reference ID",
      type: "string",
      placeholder: "RDL-2026-08A, RDL-USD-250, etc.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "drawTitle",
      title: "Draw Title",
      type: "string",
      placeholder: "100 ETB Classic Multi-Pool Draw",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "drawDate",
      title: "Draw Execution Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "broadcastVideoUrl",
      title: "Live Video Recording URL",
      type: "url",
      description: "Link to YouTube or Telegram live broadcast where founders drew the numbers",
      placeholder: "https://www.youtube.com/watch?v=...",
    }),
    defineField({
      name: "winningNumbers",
      title: "Top 10 Winning Numbers (Ordered 1st to 10th)",
      type: "array",
      of: [
        {
          type: "object",
          name: "winnerRank",
          fields: [
            defineField({ name: "rank", title: "Rank (1 to 10)", type: "number", validation: (Rule) => Rule.required().min(1).max(10) }),
            defineField({ name: "luckyNumber", title: "Winning Lucky Number", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "prizeAmount", title: "Prize Amount Won", type: "string", placeholder: "60,000 ETB or $15,000" }),
            defineField({ name: "winnerName", title: "Winner Name (Optional)", type: "string" }),
            defineField({ name: "winnerLocation", title: "Winner City / Country", type: "string" }),
            defineField({
              name: "payoutStatus",
              title: "Payout Status",
              type: "string",
              options: {
                list: [
                  { title: "🟢 Paid via Telebirr", value: "paid_telebirr" },
                  { title: "🟢 Paid via CBE Bank", value: "paid_cbe" },
                  { title: "🟢 Paid via Bank Wire / Card", value: "paid_wire" },
                  { title: "🟡 Pending Claim Verification", value: "pending" },
                ],
              },
              initialValue: "paid_telebirr",
            }),
          ],
          preview: {
            select: {
              rank: "rank",
              luckyNumber: "luckyNumber",
              prize: "prizeAmount",
            },
            prepare({ rank, luckyNumber, prize }) {
              return {
                title: `Rank #${rank || "?"} — Ticket #${luckyNumber || "???"}`,
                subtitle: prize || "",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "auditNotes",
      title: "Public Audit Notes & Verification Proof",
      type: "text",
      rows: 3,
      placeholder: "All 10 winning ranks verified against public broadcast timestamp. Payouts processed via CBE & Telebirr within 30 minutes.",
    }),
    defineField({
      name: "isPublished",
      title: "Publish to Results Page",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "drawTitle",
      subtitle: "drawId",
      date: "drawDate",
    },
    prepare({ title, subtitle, date }) {
      return {
        title: title || "Draw Result",
        subtitle: `${subtitle || ""} · ${date || ""}`,
      };
    },
  },
});
