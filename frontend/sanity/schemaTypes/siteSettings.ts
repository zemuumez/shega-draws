import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Global Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Platform Name",
      type: "string",
      initialValue: "Shega Draws",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      initialValue: "Transparent, Cryptographically Verifiable Digital Lottery",
    }),
    defineField({
      name: "logo",
      title: "Brand Logo",
      type: "image",
    }),
    defineField({
      name: "contactPhone",
      title: "Support Hotline",
      type: "string",
      placeholder: "+251 911 234 567",
    }),
    defineField({
      name: "supportEmail",
      title: "Support Email Address",
      type: "string",
      placeholder: "support@shegadraws.et",
    }),
    defineField({
      name: "telegramUrl",
      title: "Official Telegram Channel / Bot URL",
      type: "url",
      placeholder: "https://t.me/shegadraws",
    }),
    defineField({
      name: "whatsappUrl",
      title: "WhatsApp Support Link",
      type: "url",
      placeholder: "https://wa.me/251911234567",
    }),
  ],
  preview: {
    select: {
      title: "siteName",
      subtitle: "tagline",
      media: "logo",
    },
  },
});
