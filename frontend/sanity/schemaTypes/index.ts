import { type SchemaTypeDefinition } from "sanity";
import { prizeType } from "./prize";
import { paymentMethodType } from "./paymentMethod";
import { drawType } from "./draw";
import { jackpotCardType } from "./jackpotCard";
import { drawResultType } from "./drawResult";
import { contactMessageType } from "./contactMessage";
import { translationType } from "./translation";
import { promotionType } from "./promotion";
import { siteSettingsType } from "./siteSettings";
import { faqType } from "./faq";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    drawType,
    jackpotCardType,
    drawResultType,
    contactMessageType,
    translationType,
    promotionType,
    siteSettingsType,
    faqType,

    // Object types
    prizeType,
    paymentMethodType,
  ],
};
