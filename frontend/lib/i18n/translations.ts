export type Language = "en" | "am" | "ti";

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    draws: string;
    enter: string;
    myEntries: string;
    results: string;
    admin: string;
    howItWorks: string;
    eventsDeals: string;
    contact: string;
  };
  hero: {
    liveBadge: string;
    title: string;
    subtitle: string;
    enterCta: string;
    resultsCta: string;
    exploreDraws: string;
    closesIn: string;
    drawDay: string;
    trustBadge: string;
  };
  promo: {
    badge: string;
    viewAllDeals: string;
    exclusive: string;
    limitedTime: string;
    getDeal: string;
  };
  drawsExplorer: {
    title: string;
    subtitle: string;
    tabCurrent: string;
    tabUpcoming: string;
    tabPast: string;
    searchPlaceholder: string;
    allCategories: string;
    prizePool: string;
    ticketPrice: string;
    entriesTotal: string;
    drawDate: string;
    winningNumbers: string;
    enterNow: string;
    viewDetails: string;
    verifyResults: string;
    startsIn: string;
    completedOn: string;
    noDrawsFound: string;
    filterBy: string;
    statusOpen: string;
    statusUpcoming: string;
    statusRevealed: string;
    seedHash: string;
  };
  prizes: {
    title: string;
    subtitle: string;
    rank1: string;
    rank2: string;
    rank3: string;
    rankOther: string;
    tierGrand: string;
    tierMajor: string;
    tierStandard: string;
  };
  quickPick: {
    title: string;
    subtitle: string;
    selectedNumber: string;
    randomPick: string;
    checkOdds: string;
    instantEnter: string;
    hint: string;
    availability: string;
    available: string;
    taken: string;
  };
  fairness: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    verifyBtn: string;
    algoTitle: string;
    formula: string;
  };
  winners: {
    title: string;
    subtitle: string;
    liveTicker: string;
    verifiedPayout: string;
    won: string;
    draw: string;
    ticket: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    step1: string;
    step1Desc: string;
    step2: string;
    step2Desc: string;
    step3: string;
    step3Desc: string;
  };
  faq: {
    title: string;
    subtitle: string;
  };
  footer: {
    description: string;
    rights: string;
    support: string;
    compliance: string;
    transparency: string;
    quickLinks: string;
    social: string;
  };
  ticketModal: {
    title: string;
    subtitle: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    selectPrice: string;
    selectPool: string;
    chooseNumber: string;
    fullName: string;
    phoneNumber: string;
    paymentMethod: string;
    uploadReceipt: string;
    submitTicket: string;
    successTitle: string;
    successDesc: string;
  };
}

export const translations: Record<Language, Translations> = {
  // ─── ENGLISH ──────────────────────────────────────────────────────────
  en: {
    appName: "Rimna Digital Lottery",
    tagline: "Provably Fair Digital Lottery & Guaranteed Live Public Draws",
    nav: {
      draws: "Draws",
      enter: "Buy Ticket",
      myEntries: "My Tickets",
      results: "Results",
      admin: "Admin Portal",
      howItWorks: "How It Works",
      eventsDeals: "Events & Deals",
      contact: "Contact Us",
    },
    hero: {
      liveBadge: "ACTIVE DRAW · ENTRIES OPEN",
      title: "One Dream Villa. One Electric SUV. Eight More Life-Changing Rewards.",
      subtitle: "Pick a number from 00 to 99, secure your ticket via Telebirr or CBE Birr, and verify the physical draw live on video. 100% transparent and verified.",
      enterCta: "Enter Active Draw",
      resultsCta: "Verify Live Results",
      exploreDraws: "Explore All Draws",
      closesIn: "Entries close in",
      drawDay: "Draw Schedule",
      trustBadge: "100% Transparent Live Video Public Drawings",
    },
    promo: {
      badge: "FEATURED PRIZES & DEALS",
      viewAllDeals: "View Special Rewards",
      exclusive: "Holiday Jackpot Special",
      limitedTime: "Limited Pool Allocation",
      getDeal: "Claim Your Chance",
    },
    drawsExplorer: {
      title: "Digital Lottery Catalog",
      subtitle: "Explore current live prize pools, upcoming scheduled raffles, and historical verified results.",
      tabCurrent: "Current Draws",
      tabUpcoming: "Upcoming Draws",
      tabPast: "Past Results",
      searchPlaceholder: "Search by prize, draw ID or title...",
      allCategories: "All Prizes",
      prizePool: "Total Prize Value",
      ticketPrice: "Ticket Price",
      entriesTotal: "Confirmed Tickets",
      drawDate: "Draw Date",
      winningNumbers: "Winning Number",
      enterNow: "Enter This Draw",
      viewDetails: "View Details",
      verifyResults: "Verify Results",
      startsIn: "Opens In",
      completedOn: "Completed On",
      noDrawsFound: "No draws match your selection.",
      filterBy: "Filter by status",
      statusOpen: "Live & Open",
      statusUpcoming: "Scheduled Soon",
      statusRevealed: "Audited & Completed",
      seedHash: "Draw Reference Code",
    },
    prizes: {
      title: "Prize Table & Rankings",
      subtitle: "Guaranteed payouts awarded to winning numbers from Rank 1 down to Rank 10.",
      rank1: "1st Place (Grand Jackpot)",
      rank2: "2nd Place",
      rank3: "3rd Place",
      rankOther: "Place",
      tierGrand: "Grand Prize Tier",
      tierMajor: "Major Prize Tier",
      tierStandard: "Cash Rewards Tier",
    },
    quickPick: {
      title: "Interactive Number Selector",
      subtitle: "Select any lucky two-digit number (00–99) or generate a balanced random pick.",
      selectedNumber: "Selected Number",
      randomPick: "Random Pick",
      checkOdds: "Test Availability",
      instantEnter: "Proceed With Number",
      hint: "Every two-digit number has an equal mathematical probability. Earlier confirmed payment wins in case of duplicate picks.",
      availability: "Status",
      available: "Available",
      taken: "Taken (Tie-breaker applies)",
    },
    fairness: {
      title: "100% Live Video Transparency",
      subtitle: "Our physical live broadcast guarantees the winning numbers can never be manipulated by anyone.",
      step1Title: "1. Public Ticket Selection",
      step1Desc: "Players select their numbers publicly and verify their ticket entries before the pool closes.",
      step2Title: "2. Sealed Participant Pool",
      step2Desc: "All player ticket choices and payments are locked when the countdown timer reaches zero.",
      step3Title: "3. Live Physical Drawing",
      step3Desc: "Founders draw physical numbered balls live on Telegram and YouTube. Instant Telebirr / CBE payouts follow.",
      verifyBtn: "Watch Live Broadcast",
      algoTitle: "Verified Draw Procedure",
      formula: "Physical Lottery Machine · Live Continuous Video · Instant Mobile Payout",
    },
    winners: {
      title: "Recent Verified Winners",
      subtitle: "Real-time stream of confirmed payouts distributed directly to winners' mobile wallets.",
      liveTicker: "Verified Payouts",
      verifiedPayout: "Paid via Telebirr",
      won: "won",
      draw: "Draw",
      ticket: "Ticket #",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "A seamless, 3-step physical-to-digital lottery experience.",
      step1: "1. Pick Your Number",
      step1Desc: "Choose your lucky number between 00 and 99, or use the quick random generator.",
      step2: "2. Complete Payment",
      step2Desc: "Pay ticket cost securely through Telebirr or CBE Birr and upload your transaction receipt.",
      step3: "3. Live Draw & Direct Payout",
      step3Desc: "Watch founders draw physical numbers live. Cash prizes are transferred instantly to your mobile wallet.",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about security, fairness, payments, and prize collection.",
    },
    footer: {
      description: "Rimna Digital Lottery is a next-generation digital raffle platform engineered with transparency, verified live video drawings, and direct mobile wallet payouts.",
      rights: "All rights reserved. Rimna International Digital Lottery PLC.",
      support: "Support Hotline: +251 911 000 000 · support@rimnalottery.com",
      compliance: "Fully verified transactions · 100% Live Public Video Draws",
      transparency: "Live Transparency",
      quickLinks: "Platform Navigation",
      social: "Official Channels",
    },
    ticketModal: {
      title: "Purchase Official Lottery Ticket",
      subtitle: "Select your pool tier, pick your lucky number, and submit payment receipt.",
      step1Title: "1. Select Ticket Tier",
      step2Title: "2. Player Information",
      step3Title: "3. Payment Receipt",
      selectPrice: "Ticket Price (ETB / USD)",
      selectPool: "Participant Pool Capacity",
      chooseNumber: "Choose Lucky Number (00 - 99)",
      fullName: "Your Full Name",
      phoneNumber: "Phone Number (Telebirr registered)",
      paymentMethod: "Payment Method",
      uploadReceipt: "Upload Payment Screenshot / SMS",
      submitTicket: "Submit & Confirm Ticket",
      successTitle: "Ticket Submitted Successfully!",
      successDesc: "Your entry has been received and is being verified. Watch the live draw at the scheduled time!",
    },
  },

  // ─── AMHARIC (አማርኛ) ──────────────────────────────────────────────────
  am: {
    appName: "ሪምና ዲጂታል ሎተሪ",
    tagline: "በቀጥታ ቪዲዮ እጣ የሚወጣበት እና በታማኝነት የተረጋገጠ ዲጂታል ሎተሪ",
    nav: {
      draws: "እጣዎች",
      enter: "ቲኬት ይግዙ",
      myEntries: "የእኔ ቲኬቶች",
      results: "የእጣ ውጤቶች",
      admin: "የአስተዳዳሪ ፖርታል",
      howItWorks: "አሰራሩ እንዴት ነው?",
      eventsDeals: "ልዩ ሽልማቶች",
      contact: "ያግኙን",
    },
    hero: {
      liveBadge: "የቀጥታ እጣ · ቲኬት ግዢ ክፍት ነው",
      title: "አንድ ዘመናዊ ቪላ። አንድ የኤሌክትሪክ መኪና። ስምንት ሌሎች ከፍተኛ ሽልማቶች።",
      subtitle: "ከ00 እስከ 99 የሚወዱትን ቁጥር ይምረጡ፣ በቴሌብር ወይም በሲቢኢ ብር ይክፈሉ፣ በእጣው ቀን የቀጥታ ቪዲዮ እጣውን ይመልከቱ። 100% ግልጽና አስተማማኝ።",
      enterCta: "አሁኑኑ ይሳተፉ",
      resultsCta: "የቀጥታ ውጤት እይ",
      exploreDraws: "ሁሉንም እጣዎች ይመልከቱ",
      closesIn: "እጣው ለመዘጋት የቀረው ጊዜ",
      drawDay: "የእጣ መውጫ ቀን",
      trustBadge: "100% የቀጥታ ቪዲዮ ግልጽ እጣ ማውጣት",
    },
    promo: {
      badge: "ልዩ ሽልማቶች እና ማስታወቂያዎች",
      viewAllDeals: "ሁሉንም ሽልማቶች ይመልከቱ",
      exclusive: "የበዓል ልዩ ጃክፖት",
      limitedTime: "የተወሰነ የተሳታፊ ብዛት",
      getDeal: "ዕድልዎን ይሞክሩ",
    },
    drawsExplorer: {
      title: "የእጣዎች ካታሎግ",
      subtitle: "የአሁኑን ክፍት እጣዎች፣ ወደፊት የሚመጡትን እና የተጠናቀቁ የድሮ እጣ ውጤቶችን ይመልከቱ።",
      tabCurrent: "የአሁኑ እጣዎች",
      tabUpcoming: "የሚመጡ እጣዎች",
      tabPast: "ያለፉ ውጤቶች",
      searchPlaceholder: "በሽልማት፣ በእጣ መለያ ወይም ርዕስ ፈልግ...",
      allCategories: "ሁሉም ሽልማቶች",
      prizePool: "ጠቅላላ የሽልማት ዋጋ",
      ticketPrice: "የቲኬት ዋጋ",
      entriesTotal: "የተረጋገጡ ቲኬቶች",
      drawDate: "የእጣ ቀን",
      winningNumbers: "አሸናፊ ቁጥር",
      enterNow: "በዚህ እጣ ተሳተፍ",
      viewDetails: "ዝርዝሩን እይ",
      verifyResults: "ውጤቱን አረጋግጥ",
      startsIn: "የሚጀመረው በ",
      completedOn: "የተካሄደበት ቀን",
      noDrawsFound: "ምንም እጣ አልተገኘም።",
      filterBy: "በሁኔታ ለይ",
      statusOpen: "ክፍት እና በመካሄድ ላይ",
      statusUpcoming: "በቅርቡ የሚጀመር",
      statusRevealed: "የተረጋገጠ እና የተጠናቀቀ",
      seedHash: "የእጣ መለያ ኮድ",
    },
    prizes: {
      title: "የሽልማት ደረጃዎችና ሰንጠረዥ",
      subtitle: "ከደረጃ 1 እስከ ደረጃ 10 ላሉ አሸናፊ ቁጥሮች የሚሰጡ የተረጋገጡ ሽልማቶች።",
      rank1: "1ኛ ደረጃ (ታላቁ ጃክፖት)",
      rank2: "2ኛ ደረጃ",
      rank3: "3ኛ ደረጃ",
      rankOther: "ደረጃ",
      tierGrand: "ዋናው ታላቅ ሽልማት",
      tierMajor: "ከፍተኛ ሽልማቶች",
      tierStandard: "የገንዘብ ሽልማቶች",
    },
    quickPick: {
      title: "የቁጥር መምረጫ ሰሌዳ",
      subtitle: "የሚፈልጉትን ባለ ሁለት ዲጂት ቁጥር (00-99) ይምረጡ ወይም በአጋጣሚ ቁጥር መራጭ ያግኙ።",
      selectedNumber: "የተመረጠው ቁጥር",
      randomPick: "በእጣ ምረጥ",
      checkOdds: "ተገኝነትን ፈትሽ",
      instantEnter: "በዚህ ቁጥር ይቀጥሉ",
      hint: "እያንዳንዱ ባለ ሁለት አሃዝ ቁጥር እኩል የማሸነፍ እድል አለው። ሁለት ሰው ተመሳሳይ ቁጥር ቢመርጥ ቀድሞ ክፍያ ያረጋገጠው ያሸንፋል።",
      availability: "ሁኔታ",
      available: "ክፍት ነው",
      taken: "ተይዟል (የቀዳሚነት ህግ ተፈጻሚ ይሆናል)",
    },
    fairness: {
      title: "100% የቀጥታ ቪዲዮ ግልጽነት",
      subtitle: "በቀጥታ ቪዲዮ የሚወጣው እጣ ማንም ሰው ሊቀይረው ወይም ሊያጭበረብረው በማይችል መልኩ ይካሄዳል።",
      step1Title: "1. ቲኬት መቁረጥ",
      step1Desc: "ተሳታፊዎች ቁጥራቸውን በይፋ መርጠው ክፍያቸውን ያረጋግጣሉ።",
      step2Title: "2. ተሳታፊዎችን ማሰባሰብ",
      step2Desc: "የተሳታፊዎች ቁጥሮች እና ክፍያዎች ተረጋግጠው እጣው እስኪዘጋ ድረስ በስርዓቱ ይቀመጣሉ።",
      step3Title: "3. የቀጥታ ቪዲዮ እጣ እና ፈጣን ክፍያ",
      step3Desc: "በቴሌግራም እና በዩቲዩብ የቀጥታ ቪዲዮ እጣ ይወጣል፤ ወዲያውኑ በቴሌብር ክፍያ ይፈጸማል።",
      verifyBtn: "የቀጥታ ስርጭት ይመልከቱ",
      algoTitle: "የእጣ ማውጣት ሂደት",
      formula: "የእጣ ማሽን · የቀጥታ ቪዲዮ ስርጭት · ፈጣን የሞባይል ክፍያ",
    },
    winners: {
      title: "የቅርብ ጊዜ አሸናፊዎች",
      subtitle: "ሽልማታቸውን በቀጥታ በቴሌብር የተቀበሉ እውነተኛ አሸናፊዎች ዝርዝር።",
      liveTicker: "የተረጋገጡ ክፍያዎች",
      verifiedPayout: "በቴሌብር የተከፈለ",
      won: "አሸነፈ/ች",
      draw: "እጣ",
      ticket: "ቲኬት #",
    },
    howItWorks: {
      title: "ቀላል 3 ደረጃዎች",
      subtitle: "በቀላሉ ቲኬት ይቁረጡ፣ ይክፈሉ፣ በቀጥታ ቪዲዮ እጣውን ተከታትለው ያሸንፉ!",
      step1: "1. ቁጥርዎን ይምረጡ",
      step1Desc: "ከ00 እስከ 99 የሚወዱትን ወይም እድለኛ ቁጥርዎን ይምረጡ።",
      step2: "2. ክፍያ ይፈጽሙ",
      step2Desc: "በቴሌብር ወይም በሲቢኢ ብር የቲኬት ክፍያዎን ከፍለው የደረሰኝ ስክሪንሾት ያስገቡ።",
      step3: "3. የቀጥታ እጣ እና ሽልማት",
      step3Desc: "በእጣው ቀን አሸናፊው በቀጥታ ቪዲዮ ይፋ ይሆናል፤ ሽልማትዎ ወዲያውኑ ይላክልዎታል።",
    },
    faq: {
      title: "ተደጋግመው የሚጠየቁ ጥያቄዎች",
      subtitle: "ስለ ደህንነት፣ ክፍያ፣ እና ሽልማት አሰጣጥ ማወቅ የሚፈልጉት ነገር ሁሉ።",
    },
    footer: {
      description: "ሪምና ዲጂታል ሎተሪ በቀጥታ ቪዲዮ ማረጋገጫ እና በግልጽ አሰራር ላይ የተመሰረተ ዘመናዊ የዲጂታል ሎተሪ አገልግሎት ነው።",
      rights: "መብቱ በህግ የተጠበቀ ነው። ሪምና ዓለም አቀፍ ዲጂታል ሎተሪ ኃ/የተ/የግ/ማ።",
      support: "የደንበኞች አገልግሎት: +251 911 000 000 · support@rimnalottery.com",
      compliance: "100% የቀጥታ ቪዲዮ ማረጋገጫ ያለው የታማኝነት አሰራር",
      transparency: "ግልጽ አሰራር",
      quickLinks: "ፈጣን አገናኞች",
      social: "ማህበራዊ ገጾቻችን",
    },
    ticketModal: {
      title: "የሎተሪ ቲኬት ይግዙ",
      subtitle: "የእጣ ዋጋ ይምረጡ፣ ቁጥርዎን ይምረጡ፣ እና የክፍያ ደረሰኝ ያስገቡ።",
      step1Title: "1. የእጣ ዋጋ ይምረጡ",
      step2Title: "2. የተሳታፊ መረጃ",
      step3Title: "3. የክፍያ ደረሰኝ",
      selectPrice: "የቲኬት ዋጋ (ብር / ዶላር)",
      selectPool: "የተሳታፊ ብዛት መጠን",
      chooseNumber: "እድለኛ ቁጥር ይምረጡ (00 - 99)",
      fullName: "ሙሉ ስም",
      phoneNumber: "ስልክ ቁጥር (በቴሌብር የተመዘገበ)",
      paymentMethod: "የክፍያ ዘዴ",
      uploadReceipt: "የክፍያ ደረሰኝ ስክሪንሾት ይጫኑ",
      submitTicket: "ቲኬት ያረጋግጡና ይላኩ",
      successTitle: "ቲኬትዎ በተሳካ ሁኔታ ተልኳል!",
      successDesc: "መረጃዎ ደርሶናል፤ በእጣው ሰዓት የቀጥታ ቪዲዮ ስርጭቱን ይከታተሉ!",
    },
  },

  // ─── TIGRINYA (ትግርኛ / Tigray) ────────────────────────────────────────
  ti: {
    appName: "ሪምና ዲጂታል ሎተሪ",
    tagline: "ብናይ ቀጥታ ቪድዮ ዕጫ ዝወጸሉን ብተኣማንነት ዝተረጋገጸን ዲጂታል ሎተሪ",
    nav: {
      draws: "ዕጫታት",
      enter: "ቲኬት ዓድጉ",
      myEntries: "ናተይ ቲኬታት",
      results: "ናይ ዕጫ ውጽኢታት",
      admin: "ናይ ኣመሓዳሪ ፖርታል",
      howItWorks: "ኣሰራርሕኡ ብኸመይ እዩ?",
      eventsDeals: "ፍሉያት ሽልማታት",
      contact: "ርኸቡና",
    },
    hero: {
      liveBadge: "ናይ ቀጥታ ዕጫ · ቲኬት ምዕዳግ ክፉት እዩ",
      title: "ሓንቲ ዘመናዊት ቪላ። ሓንቲ ኤሌክትሪክ መኪና። ሸሞንተ ካልኦት ዓበይቲ ሽልማታት።",
      subtitle: "ካብ 00 ክሳብ 99 ዝፈትውዎ ቁጽሪ ምረጹ፣ ብቴሌብር ወይ ብሲቢኢ ብር ክፈሉ፣ ኣብ መዓልቲ ዕጫ ናይ ቀጥታ ቪድዮ ዕጫ ተኸታተሉ። 100% ግልጺን ውሑስን።",
      enterCta: "ሕጂ ተሳተፉ",
      resultsCta: "ውጽኢት ርኣዩ",
      exploreDraws: "ኩሎም ዕጫታት ርኣዩ",
      closesIn: "ዕጫ ንምዕጻው ዝተረፈ ግዜ",
      drawDay: "ዕለተ ዕጫ",
      trustBadge: "100% ናይ ቀጥታ ቪድዮ ግልጺ ዕጫ ምውጻእ",
    },
    promo: {
      badge: "ፍሉያት ሽልማታትን መወዓውዒታትን",
      viewAllDeals: "ኩሎም ሽልማታት ርኣዩ",
      exclusive: "ናይ በዓል ፍሉይ ጃክፖት",
      limitedTime: "ውሱን ናይ ተሳተፍቲ ቁጽሪ",
      getDeal: "ዕድልኩም ተጠቐሙ",
    },
    drawsExplorer: {
      title: "ካታሎግ ዕጫታት",
      subtitle: "ናይ ሕጂ ክፉታት ዕጫታት፣ ናይ ቀጻሊን ዝሓለፉ ዝተዛዘሙ ናይ ዕጫ ውጽኢታትን ርኣዩ።",
      tabCurrent: "ናይ ሕጂ ዕጫታት",
      tabUpcoming: "ዝመጹ ዕጫታት",
      tabPast: "ዝሓለፉ ውጽኢታት",
      searchPlaceholder: "ብሽልማት፣ ብናይ ዕጫ መፍለዪ ወይ ኣርእስቲ ድለዩ...",
      allCategories: "ኩሎም ሽልማታት",
      prizePool: "ጠቕላላ ዋጋ ሽልማት",
      ticketPrice: "ዋጋ ቲኬት",
      entriesTotal: "ዝተረጋገጹ ቲኬታት",
      drawDate: "ዕለተ ዕጫ",
      winningNumbers: "ተዓዋቲ ቁጽሪ",
      enterNow: "ኣብዚ ዕጫ ተሳተፉ",
      viewDetails: "ዝርዝር ርኣዩ",
      verifyResults: "ውጽኢት ኣረጋግጹ",
      startsIn: "ዝጅምረሉ",
      completedOn: "ዝተኻየደሉ ዕለት",
      noDrawsFound: "ዝኾነ ዕጫ ኣይተረኽበን።",
      filterBy: "ብኩነታት ፍለዩ",
      statusOpen: "ክፉትን ዝካየድ ዘሎን",
      statusUpcoming: "ኣብ ቀረባ ዝጅምር",
      statusRevealed: "ዝተረጋገጸን ዝተዛዘመን",
      seedHash: "ናይ ዕጫ መፍለዪ ኮድ",
    },
    prizes: {
      title: "ደረጃታትን ሰሌዳን ሽልማት",
      subtitle: "ካብ ደረጃ 1 ክሳብ ደረጃ 10 ንዝወጹ ተዓወቲ ቁጽርታት ዝወሃቡ ውሑሳት ሽልማታት።",
      rank1: "1ይ ደረጃ (ዓቢይ ጃክፖት)",
      rank2: "2ይ ደረጃ",
      rank3: "3ይ ደረጃ",
      rankOther: "ደረጃ",
      tierGrand: "ዋና ዓቢይ ሽልማት",
      tierMajor: "ላዕለዎት ሽልማታት",
      tierStandard: "ናይ ገንዘብ ሽልማታት",
    },
    quickPick: {
      title: "መመርጺ ሰሌዳ ቁጽሪ",
      subtitle: "ዝደለይዎ ክልተ ድጂት ቁጽሪ (00-99) ምረጹ ወይ ብዕጫ ቁጽሪ ኣውጽኡ።",
      selectedNumber: "ዝተመረጸ ቁጽሪ",
      randomPick: "ብዕጫ ምረጽ",
      checkOdds: "ህላወ ኣረጋግጽ",
      instantEnter: "በዚ ቁጽሪ ቀጽሉ",
      hint: "ነፍሲ ወከፍ ክልተ ኣሃዝ ቁጽሪ ማዕረ ናይ ምዕዋት ዕድል ኣለዎ። ክልተ ሰብ ሓደ ቁጽሪ እንተመሪጹ ቀዲሙ ክፍሊት ዘረጋገጸ ይዕወት።",
      availability: "ኩነታት",
      available: "ክፉት እዩ",
      taken: "ተታሒዙ (ናይ ቀዳምነት ሕጊ ይትግበር)",
    },
    fairness: {
      title: "100% ናይ ቀጥታ ቪድዮ ግልጽነት",
      subtitle: "ብቀጥታ ቪድዮ ዝወጽእ ዕጫ ዝኾነ ሰብ ክቕይሮ ወይ ከታልሎ ብዘይክእል መገዲ ይካየድ።",
      step1Title: "1. ቲኬት ምዕዳግ",
      step1Desc: "ተሳተፍቲ ቁጽሮም ብግልጺ መሪጾም ክፍሊቶም የረጋግጹ።",
      step2Title: "2. ተሳተፍቲ ምእካብ",
      step2Desc: "ናይ ተሳተፍቲ ቁጽርታትን ክፍሊታትን ተረጋጊጾም ዕጫ ክሳብ ዝዕጾ ኣብ ስርዓት ይዕቀቡ።",
      step3Title: "3. ናይ ቀጥታ ቪድዮ ዕጫን ቅልጡፍ ክፍሊትን",
      step3Desc: "ብቴሌግራምን ዩቲዩብን ብቀጥታ ቪድዮ ዕጫ ይወጽእ፤ ብኡsis ብቴሌብር ክፍሊት ይፍጸም።",
      verifyBtn: "ናይ ቀጥታ ፈነወ ርኣዩ",
      algoTitle: "ናይ ዕጫ ምውጻእ ኣሰራርሓ",
      formula: "ናይ ዕጫ ማሽን · ናይ ቀጥታ ቪድዮ ፈነወ · ቅልጡፍ ሞባይል ክፍሊት",
    },
    winners: {
      title: "ናይ ቀረባ ግዜ ተዓወትቲ",
      subtitle: "ሽልማቶም ብቀጥታ ብቴሌብር ዝተቐበሉ ናይ ሓቂ ተዓወትቲ ዝርዝር።",
      liveTicker: "ዝተረጋገጹ ክፍሊታት",
      verifiedPayout: "ብቴሌብር ዝተከፍለ",
      won: "ተዓዊቱ/ታ",
      draw: "ዕጫ",
      ticket: "ቲኬት #",
    },
    howItWorks: {
      title: "ቀለልቲ 3 ደረጃታት",
      subtitle: "ብቐሊሉ ቲኬት ዓድጉ፣ ክፈሉ፣ ብናይ ቀጥታ ቪድዮ ዕጫ ተኸታቲልኩም ተዓወቱ!",
      step1: "1. ቁጽርኹም ምረጹ",
      step1Desc: "ካብ 00 ክሳብ 99 ዝፈትውዎ ወይ ዕድለኛ ቁጽርኹም ምረጹ።",
      step2: "2. ክፍሊት ፈጽሙ",
      step2Desc: "ብቴሌብር ወይ ሲቢኢ ብር ናይ ቲኬት ክፍሊትኩም ከፊልኩም ናይ ደረሰኝ ስክሪንሾት ኣእትዉ።",
      step3: "3. ናይ ቀጥታ ዕጫን ሽልማትን",
      step3Desc: "ኣብ መዓልቲ ዕጫ ተዓዋቲ ብቀጥታ ቪድዮ ይፍለጥ፤ ሽልማትኩም ብኡsis ይለኣኸልኩም።",
    },
    faq: {
      title: "ብተደጋጋሚ ዝሕተቱ ሕቶታት",
      subtitle: "ብዛዕባ ድሕንነት፣ ክፍሊት፣ ከምኡ'ውን ኣወሃህባ ሽልማት ክትፈልጥዎ ዝግባእ ኩሉ ነገር።",
    },
    footer: {
      description: "ሪምና ዲጂታል ሎተሪ ብናይ ቀጥታ ቪድዮ ምርግጋጽን ብግልጺ ኣሰራርሓን ዝቖመ ዘመናዊ ናይ ዲጂታል ሎተሪ ኣገልግሎት እዩ።",
      rights: "መሰሉ ብሕጊ ዝተሓለወ እዩ። ሪምና ዓለም ለኸ ዲጂታል ሎተሪ ኃ/ዝ/ው/ማሕበር።",
      support: "ናይ ደንበኛታት ኣገልግሎት: +251 911 000 000 · support@rimnalottery.com",
      compliance: "100% ናይ ቀጥታ ቪድዮ ምርግጋጽ ዘለዎ ተኣማኒ ኣሰራርሓ",
      transparency: "ግልጺ ኣሰራርሓ",
      quickLinks: "ቕልጡፍ መላግቦታት",
      social: "ማሕበራዊ ገጻትና",
    },
    ticketModal: {
      title: "ናይ ሎተሪ ቲኬት ዓድጉ",
      subtitle: "ዋጋ ዕጫ ምረጹ፣ ቁጽርኹም ምረጹ፣ ናይ ክፍሊት ደረሰኝ ኣእትዉ።",
      step1Title: "1. ዋጋ ዕጫ ምረጹ",
      step2Title: "2. ናይ ተሳታፊ ሓበሬታ",
      step3Title: "3. ናይ ክፍሊት ደረሰኝ",
      selectPrice: "ዋጋ ቲኬት (ብር / ዶላር)",
      selectPool: "መጠን ቁጽሪ ተሳተፍቲ",
      chooseNumber: "ዕድለኛ ቁጽሪ ምረጹ (00 - 99)",
      fullName: "ምሉእ ስም",
      phoneNumber: "ቁጽሪ ስልኪ (ብቴሌብር ዝተመዝገበ)",
      paymentMethod: "ናይ ክፍሊት መገዲ",
      uploadReceipt: "ናይ ክፍሊት ደረሰኝ ስክሪንሾት ኣእትዉ",
      submitTicket: "ቲኬት ኣረጋግጹን ስደዱን",
      successTitle: "ቲኬትኩም ብዓወት ተሰዲዱ!",
      successDesc: "ሓበሬታኹም በጺሑና ኣሎ፤ ኣብ ሰዓት ዕጫ ናይ ቀጥታ ቪድዮ ፈነወ ተኸታተሉ!",
    },
  },
};
