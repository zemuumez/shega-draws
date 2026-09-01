import { defineField, defineType } from "sanity";

export const playerEntryType = defineType({
  name: "playerEntry",
  title: "🎟️ Submitted Ticket Receipts",
  type: "document",
  fieldsets: [
    {
      name: "playerInfo",
      title: "👤 Player Contact",
      options: { collapsible: false },
    },
    {
      name: "ticketDetails",
      title: "🎟️ Chosen Ticket & Pool Details",
      options: { collapsible: false },
    },
    {
      name: "payment",
      title: "💳 Payment & Transaction Screenshot",
      options: { collapsible: false },
    },
    {
      name: "admin",
      title: "🛡️ Admin Approval & Notes",
      options: { collapsible: false },
    },
  ],
  fields: [
    // ─── 1. Player Info ──────────────────────────────────────────────
    defineField({
      name: "playerName",
      title: "Player Full Name",
      type: "string",
      fieldset: "playerInfo",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "playerPhone",
      title: "Player Mobile Phone (Login ID)",
      type: "string",
      fieldset: "playerInfo",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),

    // ─── 2. Ticket Details ───────────────────────────────────────────
    defineField({
      name: "drawId",
      title: "Draw Reference ID",
      type: "string",
      fieldset: "ticketDetails",
      readOnly: true,
    }),
    defineField({
      name: "luckyNumber",
      title: "Selected Lucky Number (00-99)",
      type: "string",
      fieldset: "ticketDetails",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "poolCapacity",
      title: "Participant Pool Size",
      type: "string",
      fieldset: "ticketDetails",
      placeholder: "1,000 (1K), 2,000 (2K), 3,000 (3K), 5,000 (5K)",
      readOnly: true,
    }),
    defineField({
      name: "amount",
      title: "Ticket Price Paid",
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
        list: [
          { title: "ETB (Ethiopian Birr)", value: "ETB" },
          { title: "USD (US Dollars)", value: "USD" },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      fieldset: "ticketDetails",
      readOnly: true,
    }),

    // ─── 3. Payment & Screenshot Proof ────────────────────────────────
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
          { title: "Credit / Debit Card", value: "card" },
          { title: "Wire Transfer / Remittance", value: "wire" },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: "proofScreenshot",
      title: "📸 Payment Receipt Screenshot / SMS Slip",
      type: "image",
      fieldset: "payment",
      options: {
        hotspot: true,
      },
      description:
        "Inspect the payment SMS screenshot carefully to verify the transaction amount, date, and sender name before confirming.",
    }),

    // ─── 4. Admin Verification & Approval ─────────────────────────────
    defineField({
      name: "status",
      title: "Verification Status",
      type: "string",
      fieldset: "admin",
      options: {
        list: [
          { title: "🟡 Pending (Needs Verification)", value: "pending" },
          { title: "🟢 Confirmed & Approved (Valid Ticket)", value: "confirmed" },
          { title: "🔴 Rejected (Invalid / Duplicate Proof)", value: "rejected" },
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
      placeholder: "e.g. Telebirr TxID: 884729 verified on merchant portal.",
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
        subtitle: `${drawId || ""} · ${amount || 0} ${currency || "ETB"} [${(status || "PENDING").toUpperCase()}]`,
        media,
      };
    },
  },
});
