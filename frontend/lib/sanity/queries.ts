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
    currency,
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
    currency,
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

/** Fetch top 3 featured jackpot cards under hero. */
export const JACKPOT_CARDS_QUERY = defineQuery(`
  *[_type == "jackpotCard" && isActive == true] | order(order asc) {
    _id,
    serial,
    badgeTitle,
    grandPrize,
    currency,
    ticketPrice,
    drawDate,
    poolLabels,
    order
  }
`);

/** Fetch published draw results and winning numbers. */
export const LATEST_RESULTS_QUERY = defineQuery(`
  *[_type == "drawResult" && isPublished == true] | order(drawDate desc) {
    _id,
    drawId,
    drawTitle,
    drawDate,
    broadcastVideoUrl,
    winningNumbers[] {
      rank,
      luckyNumber,
      prizeAmount,
      winnerName,
      winnerLocation,
      payoutStatus
    },
    auditNotes
  }
`);

/** Fetch multilingual translations dictionary from CMS. */
export const TRANSLATIONS_QUERY = defineQuery(`
  *[_type == "translation"] {
    key,
    category,
    en,
    am,
    om,
    ti
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

/** Fetch FAQs from CMS ordered by display priority. */
export const FAQS_QUERY = defineQuery(`
  *[_type == "faq"] | order(order asc) {
    _id,
    question,
    questionAm,
    questionOm,
    answer,
    answerAm,
    answerOm,
    category,
    order
  }
`);

export interface CMSJackpotCard {
  _id: string;
  serial: string;
  badgeTitle: string;
  grandPrize: string;
  currency: string;
  ticketPrice: number;
  drawDate: string;
  poolLabels?: string[];
  order?: number;
}

export interface CMSDrawResult {
  _id: string;
  drawId: string;
  drawTitle: string;
  drawDate: string;
  broadcastVideoUrl?: string;
  winningNumbers: {
    rank: number;
    luckyNumber: string;
    prizeAmount?: string;
    winnerName?: string;
    winnerLocation?: string;
    payoutStatus?: string;
  }[];
  auditNotes?: string;
}

export interface CMSTranslation {
  key: string;
  category?: string;
  en: string;
  am?: string;
  om?: string;
  ti?: string;
}

export interface CMSFAQ {
  _id: string;
  question: string;
  questionAm?: string;
  questionOm?: string;
  answer: string;
  answerAm?: string;
  answerOm?: string;
  category?: string;
  order?: number;
}

export interface Prize {
  rank: number;
  label: string;
  labelAm?: string;
  labelOm?: string;
  prizeTitle: string;
  prizeTitleAm?: string;
  prizeTitleOm?: string;
  valueAmount?: string;
  description?: string;
  image?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  accountDetail: string;
}

export interface ActiveDraw {
  _id: string;
  title: string;
  titleAm?: string;
  titleOm?: string;
  drawId: string;
  currency?: string;
  slug?: string;
  deadline?: string;
  description?: string;
  descriptionAm?: string;
  descriptionOm?: string;
  maxNumber?: number;
  ticketPrice?: number;
  totalPrizeValue?: string;
  entryAmounts?: number[];
  heroImage?: string;
  prizes?: Prize[];
  paymentMethods?: PaymentMethod[];
}

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
