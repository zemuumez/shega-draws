import { defineField, defineType } from "sanity";

export const playerAccountType = defineType({
  name: "playerAccount",
  title: "👤 Player Accounts",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Player Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Mobile Phone Number (Unique Login ID)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pinHash",
      title: "Security PIN / Password Hash",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "registeredAt",
      title: "Registration Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Account Status",
      type: "string",
      options: {
        list: [
          { title: "🟢 Active (Verified Player)", value: "active" },
          { title: "🔴 Suspended", value: "suspended" },
        ],
      },
      initialValue: "active",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "phone",
      status: "status",
    },
    prepare({ title, subtitle, status }) {
      const icon = status === "suspended" ? "🔴" : "🟢";
      return {
        title: `${icon} ${title || "Player"}`,
        subtitle: `Phone: ${subtitle || "No phone"}`,
      };
    },
  },
});
