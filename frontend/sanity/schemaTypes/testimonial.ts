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
      title: "Location / City",
      type: "string",
      placeholder: "e.g. Addis Ababa, Ethiopia or Washington D.C., USA",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "prizeWon",
      title: "Prize Amount Won",
      type: "string",
      placeholder: "e.g. Won 300,000 ETB Jackpot",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "quote",
      title: "Testimonial Quote",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
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
