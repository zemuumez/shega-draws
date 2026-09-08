import { defineQuery } from "next-sanity";

/** Fetch all active draws from Sanity CMS */
export const ALL_DRAWS_QUERY = defineQuery(`
  *[_type == "draw"] | order(deadline desc) {
    _id,
    title,
    titleAm,
    titleTi,
    drawId,
    status,
    currency,
    ticketPrice,
    poolCapacity,
    deadline,
    liveVideoUrl
  }
`);

/** Fetch active open draw for homepage countdown */
export const ACTIVE_DRAW_QUERY = defineQuery(`
  *[_type == "draw" && status == "open"][0] {
    _id,
    title,
    titleAm,
    titleTi,
    drawId,
    currency,
    ticketPrice,
    poolCapacity,
    deadline,
    liveVideoUrl
  }
`);

/** Fetch latest live draw results and winning numbers */
export const LATEST_RESULTS_QUERY = defineQuery(`
  *[_type == "drawResult"] | order(drawDate desc) {
    _id,
    drawId,
    drawDate,
    broadcastVideoUrl,
    winningNumbers[] {
      rank,
      luckyNumber,
      prizeAmount,
      winnerName,
      payoutStatus
    }
  }
`);

/** Global site settings, default language & official payment accounts */
export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"] | order(_updatedAt desc)[0] {
    defaultLanguage,
    siteName,
    siteNameAm,
    siteNameTi,
    tagline,
    taglineAm,
    taglineTi,
    "heroBannerImageUrl": heroBannerImage.asset->url,
    "howItWorksHeroBannerImageUrl": howItWorksHeroBannerImage.asset->url,
    "resultsHeroBannerImageUrl": resultsHeroBannerImage.asset->url,
    "entriesHeroBannerImageUrl": entriesHeroBannerImage.asset->url,
    "aboutHeroBannerImageUrl": aboutHeroBannerImage.asset->url,
    "logoImageUrl": logoImage.asset->url,
    contactPhone,
    telegramHandle,
    supportEmail,
    telebirrMerchantCode,
    cbeAccountNumber,
    cbeAccountName,
    diasporaWireInstructions,
    diasporaWireInstructionsAm,
    diasporaWireInstructionsTi,
    footerDescription,
    footerDescriptionAm,
    footerDescriptionTi,
    etbPrices[]{
      value,
      label,
      isEnabled
    },
    usdPrices[]{
      value,
      label,
      isEnabled
    },
    poolSizes[]{
      size,
      label,
      ticketsCount,
      isEnabled
    }
  }
`);

/** Fetch winner testimonials */
export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial" && featured == true] {
    _id,
    name,
    location,
    locationAm,
    locationTi,
    prizeWon,
    prizeWonAm,
    prizeWonTi,
    quote,
    quoteAm,
    quoteTi,
    "avatarUrl": avatar.asset->url
  }
`);

/** Fetch promotional ads and big rewards for homepage carousel */
export const ADVERTISEMENTS_QUERY = defineQuery(`
  *[_type == "advertisement" && isActive == true] | order(order asc) {
    _id,
    title,
    titleAm,
    titleTi,
    subtitle,
    subtitleAm,
    subtitleTi,
    badge,
    badgeAm,
    badgeTi,
    "imageUrl": image.asset->url,
    estimatedValue,
    targetDrawId,
    ctaText,
    ctaTextAm,
    ctaTextTi,
    order
  }
`);

/** Fetch all UI translation strings from Sanity CMS */
export const UI_TRANSLATIONS_QUERY = defineQuery(`
  *[_type == "uiTranslation"] {
    _id,
    key,
    category,
    en,
    am,
    ti
  }
`);

/** Fetch submitted player ticket receipts (for admin overview) */
export const PLAYER_ENTRIES_QUERY = defineQuery(`
  *[_type == "playerEntry"] | order(submittedAt desc) {
    _id,
    playerName,
    playerPhone,
    drawId,
    luckyNumber,
    poolCapacity,
    amount,
    currency,
    paymentMethod,
    "proofScreenshotUrl": proofScreenshot.asset->url,
    status,
    adminNotes,
    submittedAt
  }
`);

// ── Types ─────────────────────────────────────────────────────────────

export interface CMSUITranslation {
  _id: string;
  key: string;
  category?: string;
  en: string;
  am?: string;
  ti?: string;
}

export interface CMSAdvertisement {
  _id: string;
  title: string;
  titleAm?: string;
  titleTi?: string;
  subtitle: string;
  subtitleAm?: string;
  subtitleTi?: string;
  badge: string;
  badgeAm?: string;
  badgeTi?: string;
  imageUrl: string;
  estimatedValue?: string;
  targetDrawId?: string;
  ctaText?: string;
  ctaTextAm?: string;
  ctaTextTi?: string;
  order?: number;
}

export interface CMSDraw {
  _id: string;
  title: string;
  titleAm?: string;
  titleTi?: string;
  drawId: string;
  status: "open" | "closed" | "completed";
  currency: "ETB" | "USD";
  ticketPrice: number;
  poolCapacity: number;
  deadline?: string;
  liveVideoUrl?: string;
}

export interface CMSDrawResult {
  _id: string;
  drawId: string;
  drawDate: string;
  broadcastVideoUrl?: string;
  winningNumbers?: Array<{
    rank: number;
    luckyNumber: string;
    prizeAmount: string;
    winnerName?: string;
    payoutStatus?: "paid" | "processing" | "pending";
  }>;
}

export interface CMSPriceOption {
  value: number;
  label?: string;
  isEnabled?: boolean;
}

export interface CMSPoolOption {
  size: number;
  label?: string;
  ticketsCount?: string;
  isEnabled?: boolean;
}

export interface CMSSiteSettings {
  defaultLanguage?: "en" | "am" | "ti";
  siteName?: string;
  siteNameAm?: string;
  siteNameTi?: string;
  tagline?: string;
  taglineAm?: string;
  taglineTi?: string;
  heroBannerImageUrl?: string;
  howItWorksHeroBannerImageUrl?: string;
  resultsHeroBannerImageUrl?: string;
  entriesHeroBannerImageUrl?: string;
  aboutHeroBannerImageUrl?: string;
  logoImageUrl?: string;
  contactPhone?: string;
  contactPhoneSecondary?: string;
  telegramHandle?: string;
  telegramUrl?: string;
  supportEmail?: string;
  telebirrMerchantCode?: string;
  cbeAccountNumber?: string;
  cbeAccountName?: string;
  diasporaWireInstructions?: string;
  diasporaWireInstructionsAm?: string;
  diasporaWireInstructionsTi?: string;
  footerDescription?: string;
  footerDescriptionAm?: string;
  footerDescriptionTi?: string;
  copyrightText?: string;
  complianceText?: string;
  etbPrices?: CMSPriceOption[];
  usdPrices?: CMSPriceOption[];
  poolSizes?: CMSPoolOption[];
}

export interface CMSSectionContent {
  _id?: string;
  title?: string;
  titleAm?: string;
  titleTi?: string;
  body?: string;
  bodyAm?: string;
  bodyTi?: string;
  features?: Array<{
    title: string;
    titleAm?: string;
    titleTi?: string;
    description: string;
    descriptionAm?: string;
    descriptionTi?: string;
    color?: string;
  }>;
}

export interface CMSTestimonial {
  _id: string;
  name: string;
  location: string;
  locationAm?: string;
  locationTi?: string;
  prizeWon: string;
  prizeWonAm?: string;
  prizeWonTi?: string;
  quote: string;
  quoteAm?: string;
  quoteTi?: string;
  avatarUrl?: string;
  rating?: number;
  drawTitle?: string;
}

export interface CMSPlayerEntry {
  _id: string;
  playerName: string;
  playerPhone: string;
  drawId: string;
  luckyNumber: string;
  poolCapacity: string;
  amount: number;
  currency: "ETB" | "USD";
  paymentMethod: string;
  proofScreenshotUrl?: string;
  status: "pending" | "confirmed" | "rejected";
  adminNotes?: string;
  submittedAt: string;
}
