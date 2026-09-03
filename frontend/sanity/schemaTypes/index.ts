import { type SchemaTypeDefinition } from "sanity";
import { playerEntryType } from "./playerEntry";
import { drawType } from "./draw";
import { drawResultType } from "./drawResult";
import { siteSettingsType } from "./siteSettings";
import { advertisementType } from "./advertisement";
import { testimonialType } from "./testimonial";
import { contactMessageType } from "./contactMessage";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    playerEntryType,
    drawType,
    drawResultType,
    siteSettingsType,
    advertisementType,
    testimonialType,
    contactMessageType,
  ],
};
