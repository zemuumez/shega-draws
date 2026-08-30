import { type SchemaTypeDefinition } from "sanity";
import { prizeType } from "./prize";
import { paymentMethodType } from "./paymentMethod";
import { drawType } from "./draw";
import { playerEntryType } from "./playerEntry";
import { jackpotCardType } from "./jackpotCard";
import { drawResultType } from "./drawResult";
import { contactMessageType } from "./contactMessage";
import { translationType } from "./translation";
import { promotionType } from "./promotion";
import { siteSettingsType } from "./siteSettings";
import { faqType } from "./faq";
import { heroContentType } from "./heroContent";
import { sectionContentType } from "./sectionContent";
import { testimonialType } from "./testimonial";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    drawType,
    playerEntryType,
    jackpotCardType,
    drawResultType,
    contactMessageType,
    translationType,
    promotionType,
    siteSettingsType,
    faqType,
    heroContentType,
    sectionContentType,
    testimonialType,

    // Object types
    prizeType,
    paymentMethodType,
  ],
};
