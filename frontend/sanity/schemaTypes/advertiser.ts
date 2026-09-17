import { defineField, defineType } from "sanity";

export const advertiserType = defineType({
  name: "advertiser",
  title: "📢 Advertisers & Promo Codes",
  type: "document",
  fieldsets: [
    {
      name: "profile",
      title: "👤 Influencer / Advertiser Profile",
      options: { collapsible: false },
    },
    {
      name: "promo",
      title: "🏷️ Promo Code & Referral Link",
      options: { collapsible: false },
    },
    {
      name: "commission",
      title: "💰 Commission & Earning Rates",
      options: { collapsible: false },
    },
    {
      name: "payout",
      title: "💳 Payout Account Details",
      options: { collapsible: false },
    },
    {
      name: "admin",
      title: "🛡️ Account Status & Admin Notes",
      options: { collapsible: false },
    },
  ],
  fields: [
    // ─── 1. Profile ──────────────────────────────────────────────────────────
    defineField({
      name: "name",
      title: "Advertiser / Influencer Full Name",
      type: "string",
      fieldset: "profile",
      validation: (Rule) => Rule.required().min(2).max(100),
      placeholder: "e.g. Abel TikToker / Helen Birhane",
    }),
    defineField({
      name: "platform",
      title: "Primary Platform",
      type: "string",
      fieldset: "profile",
      options: {
        list: [
          { title: "🎵 TikTok", value: "tiktok" },
          { title: "✈️ Telegram", value: "telegram" },
          { title: "▶️ YouTube", value: "youtube" },
          { title: "📸 Instagram", value: "instagram" },
          { title: "📘 Facebook", value: "facebook" },
          { title: "🌐 Website / Blog", value: "website" },
          { title: "🗣️ Word of Mouth / Agent", value: "agent" },
          { title: "✨ Other", value: "other" },
        ],
      },
      initialValue: "tiktok",
    }),
    defineField({
      name: "handleOrUrl",
      title: "Social Handle / Profile URL",
      type: "string",
      fieldset: "profile",
      placeholder: "e.g. @abel_official or https://tiktok.com/@abel_official",
    }),
    defineField({
      name: "phone",
      title: "Contact Phone Number",
      type: "string",
      fieldset: "profile",
      placeholder: "+251 911 000 000 or 0911 000 000",
    }),
    defineField({
      name: "email",
      title: "Contact Email",
      type: "string",
      fieldset: "profile",
      placeholder: "advertiser@example.com",
    }),

    // ─── 2. Promo Code & Referral ────────────────────────────────────────────
    defineField({
      name: "promoCode",
      title: "Unique Promo Code",
      type: "string",
      fieldset: "promo",
      description: "Players enter this promo code during checkout. Must be unique uppercase alphanumeric string (e.g. ABEL2026, TIKTOK50).",
      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(25)
          .regex(/^[A-Z0-9_-]+$/, {
            name: "uppercase alphanumeric",
            invert: false,
          })
          .error("Promo code must contain only uppercase letters, numbers, hyphens, and underscores (e.g. ABEL2026)."),
      initialValue: () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let rand = "";
        for (let i = 0; i < 4; i++) {
          rand += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `PROMO${rand}`;
      },
    }),

    // ─── 3. Commission & Earning Rates ───────────────────────────────────────
    defineField({
      name: "commissionPerTicket",
      title: "Commission Amount per Sold Ticket",
      type: "number",
      fieldset: "commission",
      description: "Fixed payout amount the advertiser earns for each confirmed ticket buyer.",
      initialValue: 50,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "commissionCurrency",
      title: "Commission Currency",
      type: "string",
      fieldset: "commission",
      options: {
        list: [
          { title: "ETB (Ethiopian Birr)", value: "ETB" },
          { title: "USD (US Dollars)", value: "USD" },
          { title: "Both (Match Ticket Currency)", value: "MATCH" },
        ],
      },
      initialValue: "ETB",
    }),

    // ─── 4. Payout Account Details ───────────────────────────────────────────
    defineField({
      name: "payoutMethod",
      title: "Preferred Payout Method",
      type: "string",
      fieldset: "payout",
      options: {
        list: [
          { title: "📱 Telebirr Mobile Transfer", value: "telebirr" },
          { title: "🏦 CBE Commercial Bank Account", value: "cbe" },
          { title: "🌐 International Wire / Remittance", value: "wire" },
          { title: "✨ Other", value: "other" },
        ],
      },
      initialValue: "telebirr",
    }),
    defineField({
      name: "payoutAccount",
      title: "Payout Account Number / Phone",
      type: "string",
      fieldset: "payout",
      placeholder: "e.g. 0911000000 or CBE Acc: 100012345678",
    }),
    defineField({
      name: "payoutRecipientName",
      title: "Payout Account Holder Name",
      type: "string",
      fieldset: "payout",
      placeholder: "e.g. Abel Tesfaye Bikila",
    }),

    // ─── 5. Account Status & Admin Notes ─────────────────────────────────────
    defineField({
      name: "status",
      title: "Account Status",
      type: "string",
      fieldset: "admin",
      options: {
        list: [
          { title: "🟢 Active (Tracking Enabled)", value: "active" },
          { title: "🟡 Paused (Temporarily Disabled)", value: "paused" },
          { title: "🔴 Inactive / Terminated", value: "inactive" },
        ],
        layout: "radio",
      },
      initialValue: "active",
    }),
    defineField({
      name: "notes",
      title: "Internal Notes / Campaign Details",
      type: "text",
      fieldset: "admin",
      rows: 2,
      placeholder: "e.g. TikTok partnership agreed for 50 ETB per ticket for the Meskerem 2026 draw.",
    }),
  ],
  preview: {
    select: {
      name: "name",
      promoCode: "promoCode",
      platform: "platform",
      status: "status",
      commission: "commissionPerTicket",
      currency: "commissionCurrency",
    },
    prepare({ name, promoCode, platform, status, commission, currency }) {
      const statusIcon = status === "active" ? "🟢" : status === "paused" ? "🟡" : "🔴";
      const platformIcon =
        platform === "tiktok"
          ? "🎵"
          : platform === "telegram"
          ? "✈️"
          : platform === "youtube"
          ? "▶️"
          : platform === "instagram"
          ? "📸"
          : "📢";
      return {
        title: `${statusIcon} ${name || "Unnamed Advertiser"} (${promoCode || "NO CODE"})`,
        subtitle: `${platformIcon} ${platform?.toUpperCase() || "DIRECT"} · Earns: ${commission ?? 50} ${currency || "ETB"}/ticket`,
      };
    },
  },
});
