import { defineQuery } from "next-sanity";

/** Fetch the active draw document from Sanity CMS.
 *  Contains: title, prizes, payment methods, amount presets, hero image, deadline.
 */
export const ACTIVE_DRAW_QUERY = defineQuery(`
  *[_type == "draw" && status == "open"][0] {
    _id,
    title,
    drawId,
    "slug": slug.current,
    deadline,
    description,
    maxNumber,
    entryAmounts,
    "heroImage": heroImage.asset->url,
    prizes[] {
      rank,
      label,
      prizeTitle,
      description,
      "image": image.asset->url
    },
    paymentMethods[] {
      id,
      name,
      accountDetail
    }
  }
`);

/** Fetch the draw that has been revealed (for the results page). */
export const REVEALED_DRAW_QUERY = defineQuery(`
  *[_type == "draw" && status == "revealed"] | order(_updatedAt desc)[0] {
    _id,
    title,
    drawId,
    deadline,
    prizes[] {
      rank,
      label,
      prizeTitle
    }
  }
`);

/** Global site settings singleton. */
export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    siteName,
    contactPhone,
    supportEmail,
    "logoUrl": logo.asset->url
  }
`);

export type ActiveDraw = NonNullable<Awaited<ReturnType<typeof import("./client").sanityClient.fetch<typeof ACTIVE_DRAW_QUERY>>>>;
export type Prize = NonNullable<ActiveDraw["prizes"]>[number];
export type PaymentMethod = NonNullable<ActiveDraw["paymentMethods"]>[number];
