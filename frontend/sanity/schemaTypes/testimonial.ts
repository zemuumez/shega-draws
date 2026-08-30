import { defineField, defineType } from "sanity";

export const testimonialType = defineType({
  name: "testimonial",
  title: "Customer Testimonial / Winner Quote",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Customer / Winner Name",
      type: "string",
      placeholder: "Dawit T.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "City / Country",
      type: "string",
      placeholder: "Addis Ababa, Ethiopia",
    }),
    defineField({
      name: "quote",
      title: "Testimonial Quote (English)",
      type: "text",
      rows: 3,
      placeholder: "I won 60,000 ETB on my first try! The live video broadcast made it so transparent and exciting.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "quoteAm",
      title: "Quote (Amharic / አማርኛ)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "quoteOm",
      title: "Quote (Afaan Oromoo)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "drawTitle",
      title: "Draw / Jackpot Won",
      type: "string",
      placeholder: "100 Birr Classic Multi-Pool Draw",
    }),
    defineField({
      name: "prizeWon",
      title: "Prize Amount Won",
      type: "string",
      placeholder: "60,000 ETB",
    }),
    defineField({
      name: "avatar",
      title: "Customer Photo / Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "rating",
      title: "Star Rating (1–5)",
      type: "number",
      initialValue: 5,
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: "isActive",
      title: "Show on Homepage",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 1,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "prizeWon",
      location: "location",
      isActive: "isActive",
      media: "avatar",
    },
    prepare({ title, subtitle, location, isActive, media }) {
      return {
        title: `${isActive ? "🟢" : "⚪"} ${title || "Anonymous"}`,
        subtitle: `${subtitle || ""} · ${location || ""}`,
        media,
      };
    },
  },
});
