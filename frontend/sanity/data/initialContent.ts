import { translations } from "../../lib/i18n/translations";

function flattenTranslations(enObj: any, amObj: any, tiObj: any, prefix = ""): any[] {
  const result: any[] = [];
  if (!enObj || typeof enObj !== "object") return result;

  for (const key of Object.keys(enObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const enVal = enObj[key];
    const amVal = amObj ? amObj[key] : undefined;
    const tiVal = tiObj ? tiObj[key] : undefined;

    if (typeof enVal === "string") {
      const topCat = fullKey.split(".")[0];
      let category = "general";
      if (topCat === "nav") category = "nav";
      else if (topCat === "hero" || topCat === "promo") category = "hero";
      else if (topCat === "ticket" || topCat === "configurator" || topCat === "quickPick" || topCat === "prizes" || topCat === "ticketModal") category = "ticket";
      else if (topCat === "draws" || topCat === "drawsExplorer" || topCat === "adsSection" || topCat === "resultsPage") category = "draws";
      else if (topCat === "fairness") category = "fairness";
      else if (topCat === "winners") category = "winners";
      else if (topCat === "faq") category = "faq";
      else if (topCat === "testimonials" || topCat === "testimonialsSection") category = "testimonials";
      else if (topCat === "footer") category = "footer";

      result.push({
        _id: `ui-${fullKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
        _type: "uiTranslation",
        key: fullKey,
        category,
        description: `Website text for ${fullKey}`,
        en: enVal,
        am: typeof amVal === "string" ? amVal : "",
        ti: typeof tiVal === "string" ? tiVal : "",
      });
    } else if (typeof enVal === "object" && enVal !== null && !Array.isArray(enVal)) {
      result.push(...flattenTranslations(enVal, amVal, tiVal, fullKey));
    }
  }
  return result;
}

const GENERATED_UI_TRANSLATIONS = flattenTranslations(
  translations.en,
  translations.am,
  translations.ti
);

const CORE_INITIAL_DOCUMENTS = [
  // ─── 1. Global Site Settings & Default Language ─────────────────────
  {
    _id: "siteSettings",
    _type: "siteSettings",
    defaultLanguage: "en",
    siteName: "Rimna International Digital Lottery",
    siteNameAm: "ሪምና ዓለም አቀፍ ዲጂታል ሎተሪ",
    siteNameTi: "ሪምና ዓለም ለኸ ዲጂታል ሎተሪ",
    tagline: "Provably Fair Digital Lottery & Guaranteed Live Public Draws",
    taglineAm: "በቀጥታ ቪዲዮ እጣ የሚወጣበት እና በታማኝነት የተረጋገጠ ዲጂታል ሎተሪ",
    taglineTi: "ብናይ ቀጥታ ቪድዮ ዕጫ ዝወጸሉን ብተኣማንነት ዝተረጋገጸን ዲጂታል ሎተሪ",
    contactPhone: "+251 911 000 000",
    telegramHandle: "@RimnaLotteryOfficial",
    supportEmail: "support@rimnalottery.com",
    telebirrMerchantCode: "884729",
    cbeAccountNumber: "1000 1234 5678",
    cbeAccountName: "Rimna International Digital Lottery PLC",
    diasporaWireInstructions:
      "Send USD remittance via Western Union, Remitly, or wire transfer to our official diaspora account.",
    diasporaWireInstructionsAm:
      "በቴሌግራም @RimnaLotteryOfficial የድጋፍ ቡድናችንን ያነጋግሩ ወይም በቀጥታ ወደ ዲያስፖራ የባንክ ሂሳባችን ያስተላልፉ።",
    diasporaWireInstructionsTi:
      "ብቴሌግራም @RimnaLotteryOfficial ናይ ደገፍ ጉጅለና ኣዘራርቡ ወይ ቀጥታ ናብ ናይ ዲያስፖራ ባንክ ሕሳብና ኣመሓላልፉ።",
    footerDescription:
      "Rimna Digital Lottery is a transparent, live-video verified digital lottery platform with direct mobile wallet payouts.",
    footerDescriptionAm:
      "ሪምና ዲጂታል ሎተሪ በቀጥታ ቪዲዮ ማረጋገጫ እና በግልጽ አሰራር ላይ የተመሰረተ ዘመናዊ የዲጂታል ሎተሪ አገልግሎት ነው።",
    footerDescriptionTi:
      "ሪምና ዲጂታል ሎተሪ ብናይ ቀጥታ ቪድዮ ምርግጋጽን ብግልጺ ኣሰራርሓን ዝቖመ ዘመናዊ ናይ ዲጂታል ሎተሪ ኣገልግሎት እዩ።",
    etbPrices: [
      { value: 100, label: "100", isEnabled: true },
      { value: 200, label: "200", isEnabled: true },
      { value: 500, label: "500", isEnabled: true },
      { value: 1000, label: "1,000", isEnabled: true },
    ],
    usdPrices: [
      { value: 25, label: "25", isEnabled: true },
      { value: 50, label: "50", isEnabled: true },
      { value: 100, label: "100", isEnabled: true },
      { value: 250, label: "250", isEnabled: true },
    ],
    poolSizes: [
      { size: 1000, label: "1K", ticketsCount: "1,000 tickets", isEnabled: true },
      { size: 2000, label: "2K", ticketsCount: "2,000 tickets", isEnabled: true },
      { size: 3000, label: "3K", ticketsCount: "3,000 tickets", isEnabled: true },
      { size: 5000, label: "5K", ticketsCount: "5,000 tickets", isEnabled: true },
    ],
  },

  // ─── 2. Active Draws (Multilingual) ─────────────────────────────────
  {
    _id: "draw-etb-100",
    _type: "draw",
    drawId: "RDL-ETB-100",
    title: "100 Birr Classic Multi-Pool Draw",
    titleAm: "የ100 ብር ክላሲክ እጣ",
    titleTi: "ናይ 100 ብር ክላሲክ ዕጫ",
    currency: "ETB",
    ticketPrice: 100,
    poolCapacity: 1000,
    status: "open",
    deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    liveVideoUrl: "https://t.me/RimnaLotteryOfficial",
  },
  {
    _id: "draw-etb-200",
    _type: "draw",
    drawId: "RDL-ETB-200",
    title: "200 Birr Luxury Pool Draw",
    titleAm: "የ200 ብር የቅንጦት እጣ",
    titleTi: "ናይ 200 ብር ናይ ቅንጦት ዕጫ",
    currency: "ETB",
    ticketPrice: 200,
    poolCapacity: 2000,
    status: "open",
    deadline: new Date(Date.now() + 4 * 86400000).toISOString(),
    liveVideoUrl: "https://t.me/RimnaLotteryOfficial",
  },
  {
    _id: "draw-etb-500",
    _type: "draw",
    drawId: "RDL-ETB-500",
    title: "500 Birr Grand Jackpot Draw",
    titleAm: "የ500 ብር ታላቁ ጃክፖት እጣ",
    titleTi: "ናይ 500 ብር ዓቢይ ጃክፖት ዕጫ",
    currency: "ETB",
    ticketPrice: 500,
    poolCapacity: 2000,
    status: "open",
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    liveVideoUrl: "https://t.me/RimnaLotteryOfficial",
  },
  {
    _id: "draw-etb-1000",
    _type: "draw",
    drawId: "RDL-ETB-1000",
    title: "1,000 Birr Mega Jackpot Draw",
    titleAm: "የ1,000 ብር ሜጋ ጃክፖት እጣ",
    titleTi: "ናይ 1,000 ብር ሜጋ ጃክፖት ዕጫ",
    currency: "ETB",
    ticketPrice: 1000,
    poolCapacity: 5000,
    status: "open",
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    liveVideoUrl: "https://t.me/RimnaLotteryOfficial",
  },
  {
    _id: "draw-usd-50",
    _type: "draw",
    drawId: "RDL-USD-50",
    title: "$50 USD Global Diaspora Draw",
    titleAm: "የ$50 ዶላር ዓለም አቀፍ የዲያስፖራ እጣ",
    titleTi: "ናይ $50 ዶላር ዓለም ለኸ ናይ ዲያስፖራ ዕጫ",
    currency: "USD",
    ticketPrice: 50,
    poolCapacity: 1000,
    status: "open",
    deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
    liveVideoUrl: "https://youtube.com/@RimnaLottery",
  },

  // ─── 3. Latest Live Draw Results & 10 Winners ───────────────────────
  {
    _id: "result-latest",
    _type: "drawResult",
    drawId: "RDL-2026-08",
    drawDate: "2026-08-28",
    broadcastVideoUrl: "https://youtube.com/@RimnaLottery",
    winningNumbers: [
      { rank: 1, luckyNumber: "42", prizeAmount: "300,000 ETB Grand Jackpot", winnerName: "Dawit G. (0911***42)", payoutStatus: "paid" },
      { rank: 2, luckyNumber: "89", prizeAmount: "200,000 ETB 2nd Prize", winnerName: "Marta T. (0912***89)", payoutStatus: "paid" },
      { rank: 3, luckyNumber: "07", prizeAmount: "150,000 ETB 3rd Prize", winnerName: "Abebe K. (0920***07)", payoutStatus: "paid" },
      { rank: 4, luckyNumber: "15", prizeAmount: "100,000 ETB", winnerName: "Selam W. (0933***15)", payoutStatus: "paid" },
      { rank: 5, luckyNumber: "63", prizeAmount: "70,000 ETB", winnerName: "Yonas B. (0918***63)", payoutStatus: "paid" },
      { rank: 6, luckyNumber: "77", prizeAmount: "50,000 ETB", winnerName: "Helen M. (0944***77)", payoutStatus: "paid" },
      { rank: 7, luckyNumber: "21", prizeAmount: "40,000 ETB", winnerName: "Tewodros A. (0915***21)", payoutStatus: "paid" },
      { rank: 8, luckyNumber: "94", prizeAmount: "30,000 ETB", winnerName: "Fatuma H. (0927***94)", payoutStatus: "paid" },
      { rank: 9, luckyNumber: "38", prizeAmount: "30,000 ETB", winnerName: "Bereket D. (0910***38)", payoutStatus: "paid" },
      { rank: 10, luckyNumber: "50", prizeAmount: "30,000 ETB", winnerName: "Kassahun T. (0966***50)", payoutStatus: "paid" },
    ],
  },

  // ─── 4. Winner Testimonials (Multilingual) ──────────────────────────
  {
    _id: "testimonial-1",
    _type: "testimonial",
    name: "Dawit Gebre",
    location: "Addis Ababa, Ethiopia",
    locationAm: "አዲስ አበባ, ኢትዮጵያ",
    locationTi: "ኣዲስ ኣበባ, ኢትዮጵያ",
    prizeWon: "Won 300,000 ETB Jackpot",
    prizeWonAm: "የ300,000 ብር ጃክፖት አሸናፊ",
    prizeWonTi: "ናይ 300,000 ብር ጃክፖት ተዓዋቲ",
    quote: "I watched the founders draw number 42 live on Telegram. 25 minutes later, the 300,000 Birr was credited to my Telebirr account. Unbelievable transparency!",
    quoteAm: "መስራቾቹ ቁጥር 42ን በቀጥታ በቴሌግራም ቪዲዮ ሲያወጡ ተመለከትኩ። በ25 ደቂቃ ውስጥ 300,000 ብር በቴሌብር ሂሳቤ ገባ። ፍጹም ግልጽ የሆነ አሰራር!",
    quoteTi: "መስረትቲ ቁጽሪ 42 ብቐጥታ ብቴሌግራም ቪድዮ ከውጽኡ ተዓዚበ። ድሕሪ 25 ደቒቕ 300,000 ብር ናብ ቴሌብር ሕሳበይ ኣትዩ። ፍጹም ግልጺ ዝኾነ ኣሰራርሓ!",
    featured: true,
  },
  {
    _id: "testimonial-2",
    _type: "testimonial",
    name: "Marta Tadesse",
    location: "Hawassa, Ethiopia",
    locationAm: "ሀዋሳ, ኢትዮጵያ",
    locationTi: "ሓዋሳ, ኢትዮጵያ",
    prizeWon: "Won 200,000 ETB (2nd Prize)",
    prizeWonAm: "የ200,000 ብር (2ኛ ደረጃ) አሸናፊ",
    prizeWonTi: "ናይ 200,000 ብር (2ይ ደረጃ) ተዓዋቲት",
    quote: "No hidden algorithms. You choose your number, pay directly, and watch the physical balls roll live on video.",
    quoteAm: "ምንም የተደበቀ አሰራር የለም። ቁጥርዎን ይመርጣሉ፣ ይከፍላሉ፣ በእጣው ሰዓት በቀጥታ ቪዲዮ የኳሶቹን መውጣት ያያሉ።",
    quoteTi: "ዝኾነ ዝተሓብአ ኣሰራርሓ የለን። ቁጽርኹም ትመርጹ፣ ትከፍሉ፣ ብቀጥታ ቪድዮ ዕጫ ክወጽእ ትርእዩ።",
    featured: true,
  },
  {
    _id: "testimonial-3",
    _type: "testimonial",
    name: "Solomon Bekele",
    location: "Washington D.C., USA",
    locationAm: "ዋሽንግተን ዲሲ, አሜሪካ",
    locationTi: "ዋሽንግተን ዲሲ, ኣመሪካ",
    prizeWon: "Won $15,000 USD (Diaspora Draw)",
    prizeWonAm: "የ$15,000 ዶላር (የዲያስፖራ እጣ) አሸናፊ",
    prizeWonTi: "ናይ $15,000 ዶላር (ናይ ዲያስፖራ ዕጫ) ተዓዋቲ",
    quote: "As someone in the diaspora, playing in USD and having the payout wired without hassle gave me 100% confidence.",
    quoteAm: "በዲያስፖራ የምንኖር ሰዎች በዶላር ተሳትፈን ሽልማታችን ያለ ምንም እንከን በባንክ መላኩ 100% መተማመኛ ሰጥቶኛል።",
    quoteTi: "ኣብ ዲያስፖራ ዘለና ሰባት ብዶላር ተሳቲፍና ሽልማትና ብባንክ ብዘይ ገለ ጸገም ምልኣኹ 100% ምትእምማን ሂቡኒ።",
    featured: true,
  },

  // ─── 5. Promotional Advertisements (Multilingual) ───────────────────
  {
    _id: "ad-electric-suv",
    _type: "advertisement",
    title: "Brand New 2026 Luxury Electric SUV",
    titleAm: "አዲስ 2026 የቅንጦት ኤሌክትሪክ መኪና",
    titleTi: "ሓዱሽ 2026 ናይ ቅንጦት ኤሌክትሪክ መኪና",
    subtitle: "100% Guaranteed delivery or cash equivalent. Featured grand reward in our 500 Birr Grand Jackpot Draw.",
    subtitleAm: "100% መኪናው ወይም የገንዘብ አቻው ይሰጣል። በ500 ብር ታላቁ ጃክፖት እጣ የቀረበ ታላቅ ሽልማት።",
    subtitleTi: "100% መኪና ወይ ናይ ገንዘብ ማዕረ ይወሃብ። ኣብ 500 ብር ዓቢይ ጃክፖት ዕጫ ዝቐረበ ዓቢይ ሽልማት።",
    badge: "🚗 GRAND LUXURY VEHICLE",
    badgeAm: "🚗 ታላቅ የቅንጦት መኪና",
    badgeTi: "🚗 ዓቢይ ናይ ቅንጦት መኪና",
    estimatedValue: "4,500,000 ETB / $35,000 USD",
    targetDrawId: "RDL-ETB-500",
    ctaText: "Enter Draw & Win Car",
    ctaTextAm: "እጣ ውስጥ ይግቡና መኪና ያሸንፉ",
    ctaTextTi: "ዕጫ ኣቲኹም መኪና ተዓወቱ",
    order: 1,
    isActive: true,
  },
  {
    _id: "ad-dream-villa",
    _type: "advertisement",
    title: "Contemporary 3-Bedroom Dream Villa",
    titleAm: "ዘመናዊ 3-መኝታ ያለው የህልም ቪላ ቤት",
    titleTi: "ዘመናዊ 3-መደቀሲ ዘለዎ ናይ ሕልሚ ቪላ ገዛ",
    subtitle: "Fully finished luxury architecture with private pool and panoramic views. 100% live video transparent drawing.",
    subtitleAm: "ሙሉ ለሙሉ ያለቀ ዘመናዊ ቪላ ቤት ከዋና መዋኛ ጋር። 100% በቀጥታ ቪዲዮ እጣው ይወጣል።",
    subtitleTi: "ምሉእ ብምሉእ ዝተዛዘመ ዘመናዊ ቪላ ገዛ ምስ ናይ ምሕምባስ ቦታ። 100% ብቀጥታ ቪድዮ ዕጫ ይወጽእ።",
    badge: "🏡 REAL ESTATE REWARD",
    badgeAm: "🏡 የቪላ ቤት ሽልማት",
    badgeTi: "🏡 ናይ ቪላ ገዛ ሽልማት",
    estimatedValue: "12,000,000 ETB / $95,000 USD",
    targetDrawId: "RDL-ETB-1000",
    ctaText: "Enter Draw & Win Villa",
    ctaTextAm: "እጣ ውስጥ ይግቡና ቪላ ያሸንፉ",
    ctaTextTi: "ዕጫ ኣቲኹም ቪላ ተዓወቱ",
    order: 2,
    isActive: true,
  },
  {
    _id: "ad-smart-home",
    _type: "advertisement",
    title: "Smart Kitchen & Big Electronics Mega Bundle",
    titleAm: "ዘመናዊ የኩሽና እና የኤሌክትሮኒክስ እቃዎች ስብስብ",
    titleTi: "ዘመናዊ ናይ ክሽነን ኤሌክትሮኒክስ ኣቑሑት ጥማር",
    subtitle: "Includes 4-Door Touchscreen Smart Refrigerator, 85-inch 4K OLED TV, and Flagship Tech Pack.",
    subtitleAm: "ባለ 4-በር ስማርት ፍሪጅ፣ 85-ኢንች 4K OLED ቲቪ እና ዘመናዊ የቴክኖሎጂ እቃዎችን ያካተተ።",
    subtitleTi: "ባዓል 4-ማዕጾ ስማርት ፍሪጅ፣ 85-ኢንች 4K OLED ቲቪን ዘመናዊ ናይ ቴክኖሎጂ ኣቑሑትን ዘጠቓለለ።",
    badge: "⚡ SMART HOME APPLIANCES",
    badgeAm: "⚡ ዘመናዊ የቤት እቃዎች",
    badgeTi: "⚡ ዘመናዊ ናይ ገዛ ኣቑሑት",
    estimatedValue: "1,500,000 ETB / $12,000 USD",
    targetDrawId: "RDL-ETB-200",
    ctaText: "Enter Draw & Win Tech",
    ctaTextAm: "እጣ ውስጥ ይግቡና እቃዎችን ያሸንፉ",
    ctaTextTi: "ዕጫ ኣቲኹም ኣቑሑት ተዓወቱ",
    order: 3,
    isActive: true,
  },

];

// ─── 7. Sample Submitted Ticket Receipts (For Studio Verification) ──
const SAMPLE_PLAYER_ENTRIES = [
  {
    _id: "entry-sample-telebirr-1",
    _type: "playerEntry",
    playerName: "Zemichael Tefera",
    playerPhone: "+251 911 234 567",
    drawId: "RDL-ETB-500",
    luckyNumber: "42",
    poolCapacity: "2,000 (2K)",
    amount: 500,
    currency: "ETB",
    paymentMethod: "telebirr",
    status: "pending",
    adminNotes: "Telebirr transaction SMS receipt submitted via web checkout.",
    submittedAt: new Date().toISOString(),
  },
  {
    _id: "entry-sample-cbe-2",
    _type: "playerEntry",
    playerName: "Abebe Kebede",
    playerPhone: "+251 920 889 900",
    drawId: "RDL-ETB-200",
    luckyNumber: "88",
    poolCapacity: "1,000 (1K)",
    amount: 200,
    currency: "ETB",
    paymentMethod: "cbebirr",
    status: "confirmed",
    adminNotes: "CBE Birr Ref #FT260889 verified.",
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const ALL_INITIAL_DOCUMENTS = [
  ...CORE_INITIAL_DOCUMENTS,
  ...GENERATED_UI_TRANSLATIONS,
  ...SAMPLE_PLAYER_ENTRIES,
];


