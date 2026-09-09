import { type SchemaTypeDefinition } from "sanity";
import { playerAccountType } from "./playerAccount";
import { playerEntryType } from "./playerEntry";
import { drawType } from "./draw";
import { drawResultType } from "./drawResult";
import { siteSettingsType } from "./siteSettings";
import { advertisementType } from "./advertisement";
import { testimonialType } from "./testimonial";
import { contactMessageType } from "./contactMessage";
import { uiTranslationType } from "./uiTranslation";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    playerAccountType,
    playerEntryType,
    drawType,
    drawResultType,
    siteSettingsType,
    advertisementType,
    testimonialType,
    contactMessageType,
    uiTranslationType,
  ],
};

