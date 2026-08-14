import { defineQuery } from "next-sanity";

/** Fetch all draws from Sanity CMS (open, upcoming, revealed). */
export const ALL_DRAWS_QUERY = defineQuery(`
  *[_type == "draw"] | order(deadline desc) {
    _id,
    title,
    titleAm,
    titleOm,
    drawId,
    status,
    "slug": slug.current,
    deadline,
    description,
    descriptionAm,
    descriptionOm,
    maxNumber,
    ticketPrice,
    totalPrizeValue,
    "heroImage": heroImage.asset->url,
    prizes[] {
      rank,
      label,
      labelAm,
      labelOm,
      prizeTitle,
      prizeTitleAm,
      prizeTitleOm,
      valueAmount,
      description,
      "image": image.asset->url
    },
    winningNumbers,
    seed,
    commitment
  }
`);

/** Fetch active draw document from Sanity CMS. */
export const ACTIVE_DRAW_QUERY = defineQuery(`
  *[_type == "draw" && status == "open"][0] {
    _id,
    title,
    titleAm,
    titleOm,
    drawId,
    "slug": slug.current,
    deadline,
    description,
    descriptionAm,
    descriptionOm,
    maxNumber,
    ticketPrice,
    totalPrizeValue,
    entryAmounts,
    "heroImage": heroImage.asset->url,
    prizes[] {
      rank,
      label,
      labelAm,
      labelOm,
      prizeTitle,
      prizeTitleAm,
      prizeTitleOm,
      valueAmount,
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

/** Fetch featured promotions, events, deals & sponsor ads. */
export const PROMOTIONS_QUERY = defineQuery(`
  *[_type == "promotion" && isActive == true] | order(priority asc) {
    _id,
    title,
    titleAm,
    titleOm,
    badge,
    badgeAm,
    badgeOm,
    description,
    descriptionAm,
    descriptionOm,
    ctaText,
    ctaLink,
    sponsorName,
    "bannerImage": bannerImage.asset->url,
    "sponsorLogo": sponsorLogo.asset->url,
    highlightColor,
    validUntil,
    isSponsored
  }
`);

/** Global site settings singleton. */
export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    siteName,
    tagline,
    contactPhone,
    supportEmail,
    telegramUrl,
    whatsappUrl,
    "logoUrl": logo.asset->url
  }
`);

export type ActiveDraw = NonNullable<Awaited<ReturnType<typeof import("./client").sanityClient.fetch<typeof ACTIVE_DRAW_QUERY>>>>;
export type Prize = NonNullable<ActiveDraw["prizes"]>[number];
export type PaymentMethod = NonNullable<ActiveDraw["paymentMethods"]>[number];

export interface CMSPromotion {
  _id: string;
  title: string;
  titleAm?: string;
  titleOm?: string;
  badge: string;
  badgeAm?: string;
  badgeOm?: string;
  description: string;
  descriptionAm?: string;
  descriptionOm?: string;
  ctaText: string;
  ctaLink: string;
  sponsorName?: string;
  bannerImage?: string;
  sponsorLogo?: string;
  highlightColor?: string;
  validUntil?: string;
  isSponsored?: boolean;
}
