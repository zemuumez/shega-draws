import { defineField, defineType } from "sanity";

export const playerEntryType = defineType({
  name: "playerEntry",
  title: "Ticket Entry & Payment Screenshot",
  type: "document",
  fieldsets: [
    {
      name: "playerInfo",
      title: "👤 Player Information",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "ticketDetails",
      title: "🎟️ Ticket & Draw Details",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "payment",
      title: "💳 Payment & Verification",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "admin",
      title: "🔧 Admin Review & Notes",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    // ─── Player Info ───────────────────────────────────────────────────
    defineField({
      name: "playerName",
      title: "Player Name",
      type: "string",
      fieldset: "playerInfo",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "playerPhone",
      title: "Player Phone / Contact",
      type: "string",
      fieldset: "playerInfo",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),

    // ─── Ticket Details ────────────────────────────────────────────────
    defineField({
      name: "drawId",
      title: "Draw Reference ID",
      type: "string",
      fieldset: "ticketDetails",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "luckyNumber",
      title: "Selected Lucky Number",
      type: "string",
      fieldset: "ticketDetails",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "poolCapacity",
      title: "Selected Pool Capacity",
      type: "string",
      fieldset: "ticketDetails",
      placeholder: "1,000 (1K), 2,000 (2K), etc.",
      readOnly: true,
    }),
    defineField({
      name: "amount",
      title: "Ticket Amount Paid",
      type: "number",
      fieldset: "ticketDetails",
      readOnly: true,
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      fieldset: "ticketDetails",
      options: {
        list: ["ETB", "USD"],
      },
      readOnly: true,
    }),
    defineField({
      name: "submittedAt",
      title: "Submission Timestamp",
      type: "datetime",
      fieldset: "ticketDetails",
      readOnly: true,
    }),

    // ─── Payment & Verification ────────────────────────────────────────
    defineField({
      name: "paymentMethod",
      title: "Payment Method Used",
      type: "string",
      fieldset: "payment",
      options: {
        list: [
          { title: "Telebirr SuperApp", value: "telebirr" },
          { title: "Commercial Bank of Ethiopia (CBE)", value: "cbebirr" },
          { title: "Awash Bank", value: "awash" },
          { title: "Dashen Bank", value: "dashen" },
          { title: "Bank of Abyssinia", value: "abyssinia" },
          { title: "Credit / Debit Card", value: "card" },
          { title: "Wire Transfer / Remittance", value: "wire" },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: "proofScreenshot",
      title: "📸 Payment Screenshot / Bank Receipt",
      type: "image",
      fieldset: "payment",
      options: {
        hotspot: true,
      },
      description: "Screenshot submitted by the player to verify their payment. Check the Telebirr/CBE transaction SMS or deposit slip carefully before approving.",
    }),

    // ─── Admin Review ──────────────────────────────────────────────────
    defineField({
      name: "status",
      title: "Verification Status",
      type: "string",
      fieldset: "admin",
      options: {
        list: [
          { title: "🟡 Pending (Needs Verification)", value: "pending" },
          { title: "🟢 Confirmed & Approved (Valid)", value: "confirmed" },
          { title: "🔴 Rejected (Fake/Duplicate Proof)", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    }),
    defineField({
      name: "adminNotes",
      title: "Admin Review Notes / Transaction Ref",
      type: "text",
      fieldset: "admin",
      rows: 2,
      placeholder: "e.g. Telebirr TxID: 8GH49392 verified on CBE portal.",
    }),
  ],
  preview: {
    select: {
      name: "playerName",
      phone: "playerPhone",
      drawId: "drawId",
      number: "luckyNumber",
      amount: "amount",
      currency: "currency",
      status: "status",
      media: "proofScreenshot",
    },
    prepare({ name, phone, drawId, number, amount, currency, status, media }) {
      const statusIcon = status === "confirmed" ? "🟢" : status === "rejected" ? "🔴" : "🟡";
      return {
        title: `${statusIcon} #${number || "??"} — ${name || "Anonymous"} (${phone || ""})`,
        subtitle: `${drawId || ""} · ${amount || 0} ${currency || "ETB"} [${status?.toUpperCase() || "PENDING"}]`,
        media,
      };
    },
  },
});
