import { defineField, defineType } from "sanity";

export const jackpotCardType = defineType({
  name: "jackpotCard",
  title: "Featured Jackpot Card",
  type: "document",
  fields: [
    defineField({
      name: "serial",
      title: "Card Serial / Reference ID",
      type: "string",
      placeholder: "RDL-USD-250, RDL-ETB-200, RDL-ETB-100",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "badgeTitle",
      title: "Badge Ribbon Title",
      type: "string",
      placeholder: "DIASPORA USD JACKPOT, 200 BIRR HOLIDAY JACKPOT, 100 BIRR CLASSIC MULTI-POOL",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "grandPrize",
      title: "Grand Prize Display Text",
      type: "string",
      placeholder: "$1,250,000 or 1,000,000 ETB",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      options: {
        list: [
          { title: "Local ETB (Birr)", value: "ETB" },
          { title: "Diaspora USD ($)", value: "USD" },
        ],
        layout: "radio",
      },
      initialValue: "ETB",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ticketPrice",
      title: "Ticket Price (Numeric)",
      type: "number",
      placeholder: "100, 200, 250",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "drawDate",
      title: "Draw Release Date String",
      type: "string",
      placeholder: "Friday 18th July",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "poolLabels",
      title: "Available Pool Capacity Tags",
      type: "array",
      of: [{ type: "string" }],
      initialValue: ["1K", "2K", "3K", "5K"],
    }),
    defineField({
      name: "order",
      title: "Display Order Priority",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "isActive",
      title: "Active on Homepage",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "badgeTitle",
      subtitle: "grandPrize",
      currency: "currency",
    },
    prepare({ title, subtitle, currency }) {
      return {
        title: title || "Jackpot Card",
        subtitle: `${subtitle || ""} (${currency || "ETB"})`,
      };
    },
  },
});
