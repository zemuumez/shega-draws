import { defineField, defineType } from "sanity";

export const paymentMethodType = defineType({
  name: "paymentMethod",
  title: "Payment Method",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Identifier Code",
      type: "string",
      placeholder: "telebirr, cbe, awash",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Display Name",
      type: "string",
      placeholder: "Telebirr SuperApp, Commercial Bank of Ethiopia (CBE)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "accountDetail",
      title: "Account Number / Payee Instructions",
      type: "string",
      placeholder: "0911223344 (Shega Draws Official) or CBE Acc 1000123456789",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "instructionsAm",
      title: "Instructions (Amharic)",
      type: "text",
      rows: 2,
      placeholder: "በቴሌብር መተግበሪያ ወደ 0911223344 ይላኩ እና የደረሰኝ ስክሪንሽት ይላኩ",
    }),
    defineField({
      name: "instructionsOm",
      title: "Instructions (Afaan Oromoo)",
      type: "text",
      rows: 2,
      placeholder: "Kaffaltii Telebirr lakkoofsa 0911223344 irratti ergaa",
    }),
    defineField({
      name: "icon",
      title: "Logo / Icon",
      type: "image",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "accountDetail",
      media: "icon",
    },
  },
});
