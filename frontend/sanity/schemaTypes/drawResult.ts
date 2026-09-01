import { defineField, defineType } from "sanity";

export const drawResultType = defineType({
  name: "drawResult",
  title: "🏆 Draw Results & 10 Winners",
  type: "document",
  fields: [
    defineField({
      name: "drawId",
      title: "Draw Reference Code",
      type: "string",
      placeholder: "e.g. RDL-2026-08",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "drawDate",
      title: "Date of Live Draw",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "broadcastVideoUrl",
      title: "Live Stream Recording / Video URL",
      type: "url",
      placeholder: "https://www.youtube.com/watch?v=...",
    }),
    defineField({
      name: "winningNumbers",
      title: "Top 10 Winning Numbers Drawn on Live Video",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "rank",
              title: "Rank (1 to 10)",
              type: "number",
              validation: (Rule) => Rule.required().min(1).max(10),
            }),
            defineField({
              name: "luckyNumber",
              title: "Winning Lucky Number",
              type: "string",
              placeholder: "e.g. 42",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "prizeAmount",
              title: "Prize Amount Won",
              type: "string",
              placeholder: "e.g. 300,000 ETB / Mercedes EV",
            }),
            defineField({
              name: "winnerName",
              title: "Winner Name / Phone Preview",
              type: "string",
              placeholder: "e.g. Dawit G. (0911***42)",
            }),
            defineField({
              name: "payoutStatus",
              title: "Payout Status",
              type: "string",
              options: {
                list: [
                  { title: "🟢 Paid (Transferred)", value: "paid" },
                  { title: "🟡 Processing Transfer", value: "processing" },
                  { title: "⚪ Pending Claim", value: "pending" },
                ],
              },
              initialValue: "paid",
            }),
          ],
          preview: {
            select: {
              rank: "rank",
              num: "luckyNumber",
              prize: "prizeAmount",
              winner: "winnerName",
            },
            prepare({ rank, num, prize, winner }) {
              return {
                title: `Rank #${rank || "?"}: Number ${num || "--"}`,
                subtitle: `${prize || "Cash Prize"} · Winner: ${winner || "Pending"}`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      drawId: "drawId",
      date: "drawDate",
    },
    prepare({ drawId, date }) {
      return {
        title: `🏆 Results for Draw #${drawId || "N/A"}`,
        subtitle: `Drawn on ${date || "Recent"}`,
      };
    },
  },
});
