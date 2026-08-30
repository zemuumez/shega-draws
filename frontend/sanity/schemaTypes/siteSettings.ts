import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Global Site Settings",
  type: "document",
  fieldsets: [
    {
      name: "brand",
      title: "🎨 Brand Identity",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contact",
      title: "📞 Contact & Support",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "social",
      title: "🌐 Social Media Links",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "footer",
      title: "📄 Footer & Legal",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "seo",
      title: "🔍 SEO & Meta Tags",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    // ─── Brand Identity ────────────────────────────────────────────────
    defineField({
      name: "siteName",
      title: "Platform Name",
      type: "string",
      fieldset: "brand",
      initialValue: "Rimna Digital Lottery",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline (English)",
      type: "string",
      fieldset: "brand",
      initialValue: "Transparent, Cryptographically Verifiable Digital Lottery",
    }),
    defineField({
      name: "taglineAm",
      title: "Tagline (Amharic / አማርኛ)",
      type: "string",
      fieldset: "brand",
      placeholder: "በሳይንሳዊ እና በክሪፕቶግራፊ የተረጋገጠ ዲጂታል ሎተሪ",
    }),
    defineField({
      name: "taglineOm",
      title: "Tagline (Afaan Oromoo)",
      type: "string",
      fieldset: "brand",
      placeholder: "Kiriptoogiraafiin Mirkanaa'e Carraa Dijitaalaa fi Raafilii",
    }),
    defineField({
      name: "logo",
      title: "Brand Logo",
      type: "image",
      fieldset: "brand",
    }),

    // ─── Contact & Support ─────────────────────────────────────────────
    defineField({
      name: "contactPhone",
      title: "Support Hotline (Primary)",
      type: "string",
      fieldset: "contact",
      placeholder: "+251 911 234 567",
    }),
    defineField({
      name: "contactPhoneSecondary",
      title: "Support Hotline (Secondary)",
      type: "string",
      fieldset: "contact",
      placeholder: "+251 912 345 678",
    }),
    defineField({
      name: "supportEmail",
      title: "Support Email Address",
      type: "string",
      fieldset: "contact",
      placeholder: "support@rimnalottery.com",
    }),

    // ─── Social Media ──────────────────────────────────────────────────
    defineField({
      name: "telegramUrl",
      title: "Official Telegram Channel / Bot",
      type: "url",
      fieldset: "social",
      placeholder: "https://t.me/RimnaLotteryOfficial",
    }),
    defineField({
      name: "telegramHandle",
      title: "Telegram Handle (Display)",
      type: "string",
      fieldset: "social",
      placeholder: "@RimnaLotteryOfficial",
    }),
    defineField({
      name: "whatsappUrl",
      title: "WhatsApp Support Link",
      type: "url",
      fieldset: "social",
      placeholder: "https://wa.me/251911234567",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube Channel (Live Broadcasts)",
      type: "url",
      fieldset: "social",
      placeholder: "https://youtube.com/@RimnaLottery",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook Page",
      type: "url",
      fieldset: "social",
      placeholder: "https://facebook.com/RimnaLottery",
    }),
    defineField({
      name: "tiktokUrl",
      title: "TikTok Page",
      type: "url",
      fieldset: "social",
      placeholder: "https://tiktok.com/@RimnaLottery",
    }),

    // ─── Footer & Legal ────────────────────────────────────────────────
    defineField({
      name: "footerDescription",
      title: "Footer Description (English)",
      type: "text",
      rows: 3,
      fieldset: "footer",
      placeholder: "Rimna Digital Lottery is a next-generation digital raffle platform...",
    }),
    defineField({
      name: "footerDescriptionAm",
      title: "Footer Description (Amharic)",
      type: "text",
      rows: 3,
      fieldset: "footer",
    }),
    defineField({
      name: "footerDescriptionOm",
      title: "Footer Description (Afaan Oromoo)",
      type: "text",
      rows: 3,
      fieldset: "footer",
    }),
    defineField({
      name: "copyrightText",
      title: "Copyright / Legal Text",
      type: "string",
      fieldset: "footer",
      placeholder: "All rights reserved. Digital Lottery Operations.",
    }),
    defineField({
      name: "complianceText",
      title: "Compliance / Audit Text",
      type: "string",
      fieldset: "footer",
      placeholder: "Fully verified transactions · 100% Client-Side Auditable Proofs",
    }),

    // ─── SEO ───────────────────────────────────────────────────────────
    defineField({
      name: "metaTitle",
      title: "Default Meta Title",
      type: "string",
      fieldset: "seo",
      placeholder: "Rimna Digital Lottery — Transparent Live Video Draws & Real Payouts",
    }),
    defineField({
      name: "metaDescription",
      title: "Default Meta Description",
      type: "text",
      rows: 2,
      fieldset: "seo",
      placeholder: "Ethiopia & Diaspora's premier transparent digital lottery...",
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
