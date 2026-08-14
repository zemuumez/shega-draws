import { type SchemaTypeDefinition } from "sanity";
import { prizeType } from "./prize";
import { paymentMethodType } from "./paymentMethod";
import { drawType } from "./draw";
import { promotionType } from "./promotion";
import { siteSettingsType } from "./siteSettings";
import { faqType } from "./faq";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    drawType,
    promotionType,
    siteSettingsType,
    faqType,

    // Object types
    prizeType,
    paymentMethodType,
  ],
};
