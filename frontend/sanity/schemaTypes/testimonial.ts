import { defineField, defineType } from "sanity";

export const testimonialType = defineType({
  name: "testimonial",
  title: "💬 Winner Testimonials",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Winner Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location / City (English)",
      type: "string",
      placeholder: "e.g. Addis Ababa, Ethiopia or Washington D.C., USA",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "locationAm",
      title: "Location / City (Amharic - አማርኛ)",
      type: "string",
      placeholder: "e.g. አዲስ አበባ, ኢትዮጵያ",
    }),
    defineField({
      name: "locationTi",
      title: "Location / City (Tigrinya - ትግርኛ)",
      type: "string",
      placeholder: "e.g. መቐለ, ኢትዮጵያ",
    }),
    defineField({
      name: "prizeWon",
      title: "Prize Amount Won (English)",
      type: "string",
      placeholder: "e.g. Won 300,000 ETB Jackpot",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "prizeWonAm",
      title: "Prize Amount Won (Amharic - አማርኛ)",
      type: "string",
      placeholder: "e.g. የ300,000 ብር ጃክፖት አሸናፊ",
    }),
    defineField({
      name: "prizeWonTi",
      title: "Prize Amount Won (Tigrinya - ትግርኛ)",
      type: "string",
      placeholder: "e.g. ናይ 300,000 ብር ጃክፖት ተዓዋቲ",
    }),
    defineField({
      name: "quote",
      title: "Testimonial Quote (English)",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "quoteAm",
      title: "Testimonial Quote (Amharic - አማርኛ)",
      type: "text",
      rows: 3,
      placeholder: "የአሸናፊው አስተያየት በአማርኛ...",
    }),
    defineField({
      name: "quoteTi",
      title: "Testimonial Quote (Tigrinya - ትግርኛ)",
      type: "text",
      rows: 3,
      placeholder: "ናይ ተዓዋቲ ርእይቶ ብትግርኛ...",
    }),
    defineField({
      name: "avatar",
      title: "Winner Photo / Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "featured",
      title: "Feature on Homepage",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      name: "name",
      prize: "prizeWon",
      media: "avatar",
    },
    prepare({ name, prize, media }) {
      return {
        title: name || "Winner Testimonial",
        subtitle: prize || "Grand Prize Winner",
        media,
      };
    },
  },
});
