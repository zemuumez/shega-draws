import { defineField, defineType } from "sanity";

export const contactMessageType = defineType({
  name: "contactMessage",
  title: "Contact Form Inbox Message",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Sender Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "phone",
      title: "Phone / Telegram Contact",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "topic",
      title: "Inquiry Topic",
      type: "string",
      options: {
        list: [
          { title: "🎟️ Ticket Purchase Assistance", value: "purchase" },
          { title: "🏆 Winner Payout Claim", value: "payout" },
          { title: "📺 Live Broadcast Question", value: "broadcast" },
          { title: "💳 Payment Proof Verification", value: "payment_proof" },
          { title: "💬 General Support / Other", value: "general" },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: "message",
      title: "Message Body",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "submittedAt",
      title: "Received Timestamp",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Resolution Status",
      type: "string",
      options: {
        list: [
          { title: "🔴 New (Unread / Needs Action)", value: "new" },
          { title: "🟡 In Progress (Contacting Player)", value: "in_progress" },
          { title: "🟢 Resolved (Completed)", value: "resolved" },
          { title: "⚪ Spam / Ignored", value: "spam" },
        ],
        layout: "radio",
      },
      initialValue: "new",
    }),
    defineField({
      name: "adminNotes",
      title: "Internal Support Notes",
      type: "text",
      rows: 2,
      placeholder: "e.g. Called customer on Telebirr, resolved payment proof receipt on Sep 2nd.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      phone: "phone",
      topic: "topic",
      status: "status",
      date: "submittedAt",
    },
    prepare({ title, phone, topic, status, date }) {
      const statusIcon = status === "resolved" ? "🟢" : status === "in_progress" ? "🟡" : "🔴";
      return {
        title: `${statusIcon} ${title || "Anonymous"} (${phone || ""})`,
        subtitle: `${topic || "General"} · ${date ? new Date(date).toLocaleDateString() : ""}`,
      };
    },
  },
});
