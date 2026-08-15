import { defineField, defineType } from "sanity";

export const paymentMethodType = defineType({
  name: "paymentMethod",
  title: "Payment Method",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "System Identifier",
      type: "string",
      placeholder: "telebirr, cbe, awash, dashen, abyssinia",
      description: "Suggestions: telebirr | cbe | awash | dashen | abyssinia (or custom identifier)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Provider Name (Display)",
      type: "string",
      placeholder: "Telebirr SuperApp, Commercial Bank of Ethiopia (CBE)",
      description: "Suggestions: Telebirr SuperApp | Commercial Bank of Ethiopia (CBE) | Awash Bank | Dashen Bank",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "accountDetail",
      title: "Account / Payee Number",
      type: "string",
      placeholder: "0911223344 (Shega Official) or Acc: 1000123456789",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "instructionsAm",
      title: "Instructions (Amharic / አማርኛ)",
      type: "text",
      rows: 2,
      placeholder: "በቴሌብር ወደ 0911223344 ይላኩ እና የደረሰኝ ስክሪንሽት ይላኩ",
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
