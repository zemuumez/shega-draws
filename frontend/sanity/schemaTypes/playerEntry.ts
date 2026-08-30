import { defineField, defineType } from "sanity";

export const playerEntryType = defineType({
  name: "playerEntry",
  title: "Ticket Entry & Payment Screenshot",
  type: "document",
  fields: [
    defineField({
      name: "playerName",
      title: "Player Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "playerPhone",
      title: "Player Phone / Contact",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "drawId",
      title: "Draw Reference ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "luckyNumber",
      title: "Selected Lucky Number",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "poolCapacity",
      title: "Selected Pool Capacity",
      type: "string",
      placeholder: "1,000 (1K), 2,000 (2K), etc.",
      readOnly: true,
    }),
    defineField({
      name: "amount",
      title: "Ticket Amount Paid",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      options: {
        list: ["ETB", "USD"],
      },
      readOnly: true,
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method Used",
      type: "string",
      options: {
        list: [
          { title: "Telebirr SuperApp", value: "telebirr" },
          { title: "Commercial Bank of Ethiopia (CBE)", value: "cbebirr" },
          { title: "Credit / Debit Card", value: "card" },
          { title: "Wire Transfer / Remittance", value: "wire" },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: "proofScreenshot",
      title: "Uploaded Payment Screenshot / Bank Receipt",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Screenshot submitted by user to verify Telebirr transaction SMS or CBE deposit slip.",
    }),
    defineField({
      name: "submittedAt",
      title: "Submission Timestamp",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Verification Status",
      type: "string",
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
