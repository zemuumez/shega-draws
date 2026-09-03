import { defineField, defineType } from "sanity";

export const advertisementType = defineType({
  name: "advertisement",
  title: "📢 Promotional Ads & Featured Prizes",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Advertisement Headline / Prize Name",
      type: "string",
      placeholder: "e.g. Brand New 2026 Electric Luxury SUV",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / Prize Description",
      type: "text",
      rows: 2,
      placeholder: "e.g. 100% Guaranteed payout in our 500 Birr Grand Pool. Zero rollover delays.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "badge",
      title: "Ad Category Badge",
      type: "string",
      placeholder: "e.g. 🚗 GRAND PRIZE or 🏡 LUXURY VILLA or ⚡ SMART APPLIANCES",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Advertisement / Reward Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "estimatedValue",
      title: "Estimated Cash / Prize Value",
      type: "string",
      placeholder: "e.g. 4,500,000 ETB or $35,000 USD",
    }),
    defineField({
      name: "targetDrawId",
      title: "Target Draw Reference Code",
      type: "string",
      placeholder: "e.g. RDL-ETB-500",
    }),
    defineField({
      name: "ctaText",
      title: "Call To Action Button Text",
      type: "string",
      initialValue: "Enter Draw & Win",
    }),
    defineField({
      name: "order",
      title: "Display Order Priority",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "isActive",
      title: "Active (Display on Homepage Carousel)",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      badge: "badge",
      value: "estimatedValue",
      media: "image",
    },
    prepare({ title, badge, value, media }) {
      return {
        title: `[${badge || "AD"}] ${title || "Untitled Ad"}`,
        subtitle: value ? `Estimated Value: ${value}` : "Promotional Prize",
        media,
      };
    },
  },
});
