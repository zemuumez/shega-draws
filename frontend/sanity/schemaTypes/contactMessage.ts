import { defineField, defineType } from "sanity";

export const contactMessageType = defineType({
  name: "contactMessage",
  title: "✉️ Player Contact Messages",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Sender Full Name",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "subject",
      title: "Subject / Inquiry Type",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "message",
      title: "Message Text",
      type: "text",
      rows: 4,
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "🟡 Unread", value: "unread" },
          { title: "🟢 Resolved / Replied", value: "resolved" },
        ],
      },
      initialValue: "unread",
    }),
    defineField({
      name: "submittedAt",
      title: "Received Timestamp",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      name: "name",
      subject: "subject",
      status: "status",
      date: "submittedAt",
    },
    prepare({ name, subject, status, date }) {
      const icon = status === "resolved" ? "🟢" : "🟡";
      return {
        title: `${icon} ${name || "Unknown"} — ${subject || "General Inquiry"}`,
        subtitle: date ? new Date(date).toLocaleString() : "Recent",
      };
    },
  },
});
