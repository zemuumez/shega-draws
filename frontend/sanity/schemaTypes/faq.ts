import { defineField, defineType } from "sanity";

export const faqType = defineType({
  name: "faq",
  title: "Frequently Asked Questions",
  type: "document",
  fieldsets: [
    { name: "multilingual", title: "Amharic & Afaan Oromoo Translations", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "question",
      title: "Question (English)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer (English)",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Fairness & Trust", value: "fairness" },
          { title: "Payments & Verification", value: "payments" },
          { title: "Prizes & Delivery", value: "prizes" },
          { title: "Account & Tickets", value: "account" },
        ],
      },
      initialValue: "fairness",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "questionAm",
      title: "Question (Amharic / አማርኛ)",
      type: "string",
      fieldset: "multilingual",
    }),
    defineField({
      name: "answerAm",
      title: "Answer (Amharic / አማርኛ)",
      type: "text",
      rows: 4,
      fieldset: "multilingual",
    }),
    defineField({
      name: "questionOm",
      title: "Question (Afaan Oromoo)",
      type: "string",
      fieldset: "multilingual",
    }),
    defineField({
      name: "answerOm",
      title: "Answer (Afaan Oromoo)",
      type: "text",
      rows: 4,
      fieldset: "multilingual",
    }),
  ],
  preview: {
    select: {
      title: "question",
      subtitle: "category",
    },
  },
});
