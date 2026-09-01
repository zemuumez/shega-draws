import { defineQuery } from "next-sanity";

/** Fetch all active draws from Sanity CMS */
export const ALL_DRAWS_QUERY = defineQuery(`
  *[_type == "draw"] | order(deadline desc) {
    _id,
    title,
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

/** Global site settings & official payment accounts */
export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    siteName,
    "heroBannerImageUrl": heroBannerImage.asset->url,
    "logoImageUrl": logoImage.asset->url,
    contactPhone,
    telegramHandle,
    supportEmail,
    telebirrMerchantCode,
    cbeAccountNumber,
    cbeAccountName,
    diasporaWireInstructions
  }
`);

/** Fetch winner testimonials */
export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial" && featured == true] {
    _id,
    name,
    location,
    prizeWon,
    quote,
    "avatarUrl": avatar.asset->url
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

export interface CMSDraw {
  _id: string;
  title: string;
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

export interface CMSSiteSettings {
  siteName?: string;
  tagline?: string;
  heroBannerImageUrl?: string;
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
  footerDescription?: string;
  footerDescriptionAm?: string;
  footerDescriptionOm?: string;
  copyrightText?: string;
  complianceText?: string;
}

export interface CMSTestimonial {
  _id: string;
  name: string;
  location: string;
  prizeWon: string;
  quote: string;
  quoteAm?: string;
  quoteOm?: string;
  avatarUrl?: string;
  rating?: number;
  drawTitle?: string;
}

export interface CMSSectionContent {
  _id?: string;
  title?: string;
  titleAm?: string;
  titleOm?: string;
  body?: string;
  bodyAm?: string;
  bodyOm?: string;
  features?: Array<{
    title: string;
    titleAm?: string;
    titleOm?: string;
    description: string;
    descriptionAm?: string;
    descriptionOm?: string;
    color?: string;
  }>;
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
