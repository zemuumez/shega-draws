import { defineField, defineType } from "sanity";

export const testimonialType = defineType({
  name: "testimonial",
  title: "Winner Testimonial & Review",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Winner Full Name",
      type: "string",
      placeholder: "Tewodros Kassahun, Helen Mengistu, etc.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location / City / Country",
      type: "string",
      placeholder: "Addis Ababa, Hawassa, Washington DC",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "prize",
      title: "Prize Won Description",
      type: "string",
      placeholder: "80,000 ETB (1st Place Winner) or $15,000 USD",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "quote",
      title: "Testimonial Quote / Review",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rating",
      title: "Star Rating (1 to 5)",
      type: "number",
      initialValue: 5,
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: "order",
      title: "Display Order Priority",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "isActive",
      title: "Published on Homepage",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "prize",
      location: "location",
    },
    prepare({ title, subtitle, location }) {
      return {
        title: title || "Winner Testimonial",
        subtitle: `${subtitle || ""} · ${location || ""}`,
      };
    },
  },
});
