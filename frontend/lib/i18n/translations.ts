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
    whyRimna: string;
    eventsDeals: string;
    contact: string;
    officialTelegram: string;
    hotline247: string;
    signIn: string;
    signOut: string;
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
    guaranteedWinnersBadge: string;
    oddsBadge: string;
    cardTitle: string;
    cardDesc: string;
    cardCta: string;
  };
  promo: {
    badge: string;
    viewAllDeals: string;
    exclusive: string;
    limitedTime: string;
    getDeal: string;
  };
  adsSection: {
    badge: string;
    title: string;
    hoverToPause: string;
    resumeScroll: string;
    upcomingPool: string;
    comingSoon: string;
    stayTuned: string;
    videoDraw: string;
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
  configurator: {
    title: string;
    subtitle: string;
    currencyStep: string;
    ticketPriceStep: string;
    poolStep: string;
    selectedPriceLabel: string;
    ticketsCountLabel: string;
    payoutsTitle: string;
    showAllPrizes: string;
    hidePrizes: string;
    summaryTitle: string;
    summaryBadge: string;
    totalPrizePool: string;
    firstJackpot: string;
    poolCapacity: string;
    winningOdds: string;
    oddsValue: string;
    cashWinners: string;
    guaranteedCount: string;
    drawBroadcast: string;
    buyTicketBtn: string;
    howItWorksLink: string;
    pastResultsLink: string;
    winners10Badge: string;
    liveVideoBadge: string;
    tenWinners?: string;
    liveVideo?: string;
    currencyNational?: string;
    currencyDiaspora?: string;
    paused?: string;
    people?: string;
    allPayoutsTitle?: string;
    topPayoutsTitle?: string;
    etbLabel: string;
    usdLabel: string;
    etbSub: string;
    usdSub: string;
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
    badge: string;
    title: string;
    subtitle: string;
    liveTicker: string;
    verifiedPayout: string;
    won: string;
    draw: string;
    ticket: string;
  };
  testimonialsSection: {
    badge: string;
    title: string;
    subtitle: string;
    winnerStoriesTitle: string;
    communityTitle: string;
    communityDesc: string;
    joinAlertsBtn: string;
    inputPlaceholder: string;
    subscribedMsg: string;
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
  howItWorksPage: {
    badge: string;
    title: string;
    subtitle: string;
    chooseTicketCta: string;
    viewResultsCta: string;
    mathGuaranteeBadge: string;
    scheduleTitle: string;
    payoutNoRolloverBadge: string;
    steps: Array<{
      stepNumber: string;
      badge: string;
      title: string;
      description: string;
      highlights: string[];
    }>;
    scheduleTiers: Array<{
      rank: string;
      share: string;
      desc: string;
    }>;
  };
  resultsPage: {
    badge: string;
    title: string;
    subtitle: string;
    latestAuditBadge: string;
    winningNumbersTitle: string;
    auditedBadge: string;
    payoutNotice: string;
    supportBadge: string;
    supportTitle: string;
    supportDesc: string;
    callBtn: string;
    telegramBtn: string;
    rankLabels: {
      first: string;
      second: string;
      third: string;
      other: string;
    };
  };
  aboutPage: {
    badge: string;
    title: string;
    subtitle: string;
    pickNumberCta: string;
    readGuideCta: string;
    careBadge: string;
    careTitle: string;
    careDesc: string;
    callBtn: string;
    telegramBtn: string;
  };
  entriesPage: {
    badge: string;
    title: string;
    subtitle: string;
    playerProfile: string;
    verifiedBadge: string;
    statsTotal: string;
    statsActive: string;
    statsPending: string;
    statsWins: string;
    tabAll: string;
    tabActive: string;
    tabPending: string;
    receiptPreview: string;
    drawRef: string;
    luckyNumberBadge: string;
    poolTier: string;
    searchPlaceholder: string;
    filterStatus: string;
    liveBroadcastNotice: string;
    loginTitle: string;
    loginDesc: string;
    phoneLabel: string;
    nameLabel: string;
    signInBtn: string;
    emptyTitle: string;
    emptyDesc: string;
    buyFirstBtn: string;
    myTicketsTitle: string;
    refreshBtn: string;
    signOutBtn: string;
    statusPending: string;
    statusConfirmed: string;
    statusRejected: string;
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
  // ─── 1. ENGLISH ───────────────────────────────────────────────────────
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
      whyRimna: "Why Rimna",
      eventsDeals: "Events & Deals",
      contact: "Contact Us",
      officialTelegram: "Official Telegram:",
      hotline247: "24/7 Hotline:",
      signIn: "Sign In",
      signOut: "Sign Out",
    },
    hero: {
      liveBadge: "100% LIVE VIDEO DRAWS · AUDITED BROADCAST",
      title: "Win Ethiopia's Biggest Live Digital Jackpot",
      subtitle: "Pick a number from 00 to 99, secure your ticket via Telebirr or CBE Birr, and verify the physical draw live on video. 100% transparent and verified.",
      enterCta: "Check Pool & Enter",
      resultsCta: "Verify Live Results",
      exploreDraws: "Explore All Draws",
      closesIn: "Entries close in",
      drawDay: "Draw Schedule",
      trustBadge: "100% Live Video Draws · Audited Broadcast",
      guaranteedWinnersBadge: "10 GUARANTEED WINNERS",
      oddsBadge: "High Winning Odds (1 in 100)",
      cardTitle: "100% Guaranteed Cash Payouts In Every Single Pool",
      cardDesc: "No endless rollover delays. Every single draw pays out 10 distinct cash ranks live on video within 30 minutes.",
      cardCta: "Explore Live Pools",
    },
    promo: {
      badge: "FEATURED PRIZES & DEALS",
      viewAllDeals: "View Special Rewards",
      exclusive: "Holiday Jackpot Special",
      limitedTime: "Limited Pool Allocation",
      getDeal: "Claim Your Chance",
    },
    adsSection: {
      badge: "UPCOMING LOTTERIES & SPONSOR SHOWCASE",
      title: "Major Grand Prizes & Coming Soon Draws",
      hoverToPause: "Hover to Pause",
      resumeScroll: "Resume Scroll",
      upcomingPool: "UPCOMING OFFICIAL POOL",
      comingSoon: "COMING SOON",
      stayTuned: "Stay Tuned",
      videoDraw: "100% Video Draw",
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
    configurator: {
      title: "Interactive Ticket Configurator",
      subtitle: "Capped Pools · 10 Guaranteed Winners · 100% Video Draw",
      currencyStep: "1. CURRENCY",
      ticketPriceStep: "2. TICKET PRICE",
      poolStep: "3. PARTICIPANT POOL",
      selectedPriceLabel: "Selected",
      ticketsCountLabel: "tickets",
      payoutsTitle: "TOP 3 GUARANTEED PAYOUTS",
      showAllPrizes: "Show All 10 Prizes",
      hidePrizes: "Hide Extra Ranks",
      summaryTitle: "Live Draw Tier Summary",
      summaryBadge: "100% VIDEO DRAW",
      totalPrizePool: "TOTAL PRIZE POOL",
      firstJackpot: "1ST GRAND JACKPOT",
      poolCapacity: "POOL CAPACITY",
      winningOdds: "WINNING ODDS",
      oddsValue: "1 in 100 (High Odds)",
      cashWinners: "CASH WINNERS",
      guaranteedCount: "10 Guaranteed",
      drawBroadcast: "DRAW BROADCAST",
      buyTicketBtn: "Buy Ticket",
      howItWorksLink: "How It Works",
      pastResultsLink: "Past Results",
      winners10Badge: "10 Winners",
      liveVideoBadge: "Live Video",
      etbLabel: "ETB (Birr)",
      usdLabel: "USD ($)",
      etbSub: "Ethiopia National",
      usdSub: "Global Remittance",
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
      badge: "100% TRANSPARENT PLAYER PROOFS",
      title: "Real Winners. Instant Video Payouts.",
      subtitle: "Hear directly from verified Ethiopian & Diaspora winners who watched their numbers drawn live.",
      liveTicker: "Verified Payouts",
      verifiedPayout: "Paid via Telebirr",
      won: "won",
      draw: "Draw",
      ticket: "Ticket #",
    },
    testimonialsSection: {
      badge: "WINNER TESTIMONIALS",
      title: "Winner Testimonials",
      subtitle: "Real stories from verified lottery winners.",
      winnerStoriesTitle: "Winner Testimonials",
      communityTitle: "Official Community & Alerts",
      communityDesc: "Get instant Telegram and SMS notifications when a new jackpot pool opens or winning numbers are drawn live on video.",
      joinAlertsBtn: "Join Alerts",
      inputPlaceholder: "Enter email or Telegram @handle",
      subscribedMsg: "Subscribed! You will receive draw notifications.",
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
    howItWorksPage: {
      badge: "COMPLETE TRANSPARENCY & PLAYER GUIDE",
      title: "How Rimna Digital Lottery Works",
      subtitle: "Built on 100% genuine public transparency. Learn how to configure your lucky numbers, complete instant mobile checkout, watch company founders draw the 10 guaranteed winners live on video, and claim verified cash payouts.",
      chooseTicketCta: "Choose Your Ticket Now",
      viewResultsCta: "View Live & Past Results",
      mathGuaranteeBadge: "100% MATHEMATICAL GUARANTEE",
      scheduleTitle: "Top 10 Prize Payout Schedule",
      payoutNoRolloverBadge: "100% Payout / No Rollover",
      steps: [
        {
          stepNumber: "01",
          badge: "SELECT YOUR TIER",
          title: "Pick Your Lucky Number & Pool Capacity",
          description: "Choose any 2-digit lucky number from 00 to 99, or click Quick Pick for an instant selection. Select your preferred ticket price (100, 200, 500, or 1,000 ETB) and capped participant pool (1K, 2K, 3K, or 5K).",
          highlights: [
            "Fixed, capped participant pool ensures your odds remain high (1 in 100).",
            "Real-time calculations show total pool value and exact Top 10 prize amounts.",
            "Instant multi-ticket purchasing with unique serial numbers.",
          ],
        },
        {
          stepNumber: "02",
          badge: "INSTANT MOBILE PAYMENT",
          title: "Pay Seamlessly via Telebirr, CBE, or Cards",
          description: "Complete your entry in seconds using Ethiopia's most trusted payment channels or international cards. Enter your phone number, submit payment, and receive your digital ticket with instant cryptographic verification.",
          highlights: [
            "Supported: Telebirr, CBE Birr, Awash, Bank of Abyssinia, Dashen, Visa & Mastercard.",
            "Automated verification confirms your ticket in under 30 seconds.",
            "Receive SMS confirmation and unique verifiable ticket stub.",
          ],
        },
        {
          stepNumber: "03",
          badge: "100% TRANSPARENT BROADCAST",
          title: "Watch Founders Draw Winners Live on Video",
          description: "No secret computer algorithms or automated backdoors. Company founders draw all winning numbers physically on live video stream. Each selected number is held up to the camera and announced publicly in real time.",
          highlights: [
            "Scheduled public video stream broadcast on Telegram & Web.",
            "Founders physically pull winning balls from the illuminated lottery tumbler.",
            "Draw video archive is permanently recorded and available for replay.",
          ],
        },
        {
          stepNumber: "04",
          badge: "GUARANTEED PAYOUTS",
          title: "Top 10 Guaranteed Winners Claim Instant Cash",
          description: "Every single draw awards guaranteed cash prizes across 10 distinct winning ranks totaling 100% of the player prize pool. Winnings are deposited directly into your Telebirr or bank account within minutes.",
          highlights: [
            "1st Rank (Jackpot): 30% of total prize pool.",
            "2nd Rank: 20% · 3rd Rank: 15% · 4th Rank: 8% · 5th Rank: 6%.",
            "6th–10th Ranks: 4%–5% guaranteed cash payouts.",
          ],
        },
      ],
      scheduleTiers: [
        { rank: "#1 Grand Jackpot", share: "30% of Pool", desc: "Top Cash / Luxury Reward" },
        { rank: "#2 Luxury Prize", share: "20% of Pool", desc: "Guaranteed High Cash" },
        { rank: "#3 High Cash", share: "15% of Pool", desc: "Guaranteed Cash" },
        { rank: "#4 Cash Winner", share: "8% of Pool", desc: "Direct Bank Transfer" },
        { rank: "#5 Cash Winner", share: "6% of Pool", desc: "Direct Bank Transfer" },
        { rank: "#6 Cash Winner", share: "5% of Pool", desc: "Direct Bank Transfer" },
        { rank: "#7–#10 (4 Winners)", share: "4% Each (16%)", desc: "Instant Mobile Deposit" },
      ],
    },
    resultsPage: {
      badge: "OFFICIAL AUDITED RESULTS & BROADCAST",
      title: "Official Live Draw Results",
      subtitle: "All 10 winning ranks are drawn publicly on video stream by company founders. Explore official lucky numbers, guaranteed prize distributions, and live video replays.",
      latestAuditBadge: "LATEST COMPLETED DRAW AUDIT",
      winningNumbersTitle: "Top 10 Winning Numbers",
      auditedBadge: "10 Guaranteed Winners Audited",
      payoutNotice: "All payouts are automatically transferred within 30 minutes of live draw completion to the winner's verified CBE or Telebirr account.",
      supportBadge: "NEED ASSISTANCE WITH WINNING CLAIMS?",
      supportTitle: "Live Support 24/7 Hotline",
      supportDesc: "Our customer care team verifies winning tickets and assists with Telebirr and CBE bank payouts around the clock.",
      callBtn: "Call Hotline",
      telegramBtn: "Telegram Channel",
      rankLabels: {
        first: "🥇 1st (Jackpot)",
        second: "🥈 2nd Place",
        third: "🥉 3rd Place",
        other: "Rank #",
      },
    },
    aboutPage: {
      badge: "ETHIOPIA & DIASPORA TRANSPARENT LOTTERY",
      title: "Why Rimna Digital Lottery?",
      subtitle: "Ethiopia and the Diaspora's premier digital lottery built on genuine public transparency, fixed capped participant pools, and 10 guaranteed winners per draw.",
      pickNumberCta: "Pick Lucky Number Now",
      readGuideCta: "Read Full Guide",
      careBadge: "24/7 DEDICATED CUSTOMER CARE",
      careTitle: "Official Player Assistance & Verification",
      careDesc: "Have questions about ticket verification, payment methods, or claiming cash payouts? Our team is available 24 hours a day.",
      callBtn: "Call Us",
      telegramBtn: "Join Telegram",
    },
    entriesPage: {
      badge: "MY OFFICIAL LOTTERY TICKETS",
      title: "My Purchased Tickets",
      subtitle: "Track your active tickets, verified lucky numbers, and live draw winning statuses.",
      playerProfile: "Player Profile",
      verifiedBadge: "Verified Ticket Holder",
      statsTotal: "Total Tickets",
      statsActive: "Active in Live Draw",
      statsPending: "Pending Verification",
      statsWins: "Guaranteed Payouts",
      tabAll: "All Tickets",
      tabActive: "Confirmed & Active",
      tabPending: "Pending Approval",
      receiptPreview: "View Payment Slip",
      drawRef: "Draw Reference Code",
      luckyNumberBadge: "Lucky Number",
      poolTier: "Pool Capacity",
      searchPlaceholder: "Search by Draw ID or lucky number...",
      filterStatus: "All Statuses",
      liveBroadcastNotice: "100% Live Audited Video Broadcast",
      loginTitle: "Sign In to View Your Tickets",
      loginDesc: "Enter your phone number used during ticket purchase to view all your confirmed entries.",
      phoneLabel: "Phone Number (e.g. 0911000000)",
      nameLabel: "Your Name (Optional)",
      signInBtn: "View My Tickets",
      emptyTitle: "No Tickets Found",
      emptyDesc: "You have not purchased any tickets yet. Pick your lucky number in our active draw and win big!",
      buyFirstBtn: "Buy Your First Ticket",
      myTicketsTitle: "Confirmed Tickets",
      refreshBtn: "Refresh Tickets",
      signOutBtn: "Sign Out",
      statusPending: "Pending Verification",
      statusConfirmed: "Confirmed & Active",
      statusRejected: "Payment Rejected",
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

  // ─── 2. AMHARIC (አማርኛ) ───────────────────────────────────────────────
  am: {
    appName: "ሪምና ዲጂታል ሎተሪ",
    tagline: "በቀጥታ ቪዲዮ እጣ የሚወጣበት እና በታማኝነት የተረጋገጠ ዲጂታል ሎተሪ",
    nav: {
      draws: "እጣዎች",
      enter: "ቲኬት ይግዙ",
      myEntries: "የእኔ ቲኬቶች",
      results: "ውጤቶች",
      admin: "የአስተዳዳሪ ፖርታል",
      howItWorks: "አሰራሩ እንዴት ነው?",
      whyRimna: "ለምን ሪምና?",
      eventsDeals: "ልዩ ሁነቶች እና ቅናሾች",
      contact: "ያግኙን",
      officialTelegram: "ይፋዊ ቴሌግራም:",
      hotline247: "የ24/7 መስመር:",
      signIn: "ይግቡ",
      signOut: "ይውጡ",
    },
    hero: {
      liveBadge: "100% የቀጥታ ቪዲዮ እጣ · የተረጋገጠ ስርጭት",
      title: "የኢትዮጵያን ትልቁን የቀጥታ ዲጂታል ጃክፖት ያሸንፉ",
      subtitle: "ከ00 እስከ 99 የሚወዱትን ቁጥር ይምረጡ፣ በቴሌብር ወይም በሲቢኢ ብር ይክፈሉ፣ በእጣው ቀን የቀጥታ ቪዲዮ እጣውን ይመልከቱ። 100% ግልጽና አስተማማኝ።",
      enterCta: "እጣውን ይፈትሹና ይሳተፉ",
      resultsCta: "የቀጥታ ውጤት እይ",
      exploreDraws: "ሁሉንም እጣዎች ይመልከቱ",
      closesIn: "እጣው ለመዘጋት የቀረው ጊዜ",
      drawDay: "የእጣ መውጫ ቀን",
      trustBadge: "100% የቀጥታ ቪዲዮ እጣ · የተረጋገጠ ስርጭት",
      guaranteedWinnersBadge: "10 የተረጋገጡ አሸናፊዎች",
      oddsBadge: "ከፍተኛ የማሸነፍ እድል (1 በ 100)",
      cardTitle: "በእያንዳንዱ እጣ 100% የተረጋገጠ የገንዘብ ክፍያ",
      cardDesc: "ምንም የማያልቅ ማዘግየት የለም። እያንዳንዱ እጣ በ30 ደቂቃ ውስጥ ለ10 አሸናፊዎች በቀጥታ ቪዲዮ ይከፈላል።",
      cardCta: "የቀጥታ እጣዎችን ይመልከቱ",
    },
    promo: {
      badge: "ልዩ ሽልማቶች እና ማስታወቂያዎች",
      viewAllDeals: "ሁሉንም ሽልማቶች ይመልከቱ",
      exclusive: "የበዓል ልዩ ጃክፖት",
      limitedTime: "የተወሰነ የተሳታፊ ብዛት",
      getDeal: "ዕድልዎን ይሞክሩ",
    },
    adsSection: {
      badge: "የሚመጡ ሎተሪዎች እና ታላላቅ ሽልማቶች",
      title: "ታላላቅ የጃክፖት ሽልማቶች እና በቅርቡ የሚመጡ እጣዎች",
      hoverToPause: "ለማቆም ማውሱን ያሳርፉ",
      resumeScroll: "ማንሸራተት ቀጥል",
      upcomingPool: "በቅርቡ የሚከፈት ይፋዊ እጣ",
      comingSoon: "በቅርቡ ይጠብቁ",
      stayTuned: "ይከታተሉ",
      videoDraw: "100% የቀጥታ ቪዲዮ እጣ",
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
    configurator: {
      title: "የቲኬት መምረጫ እና ማበጃ ሰሌዳ",
      subtitle: "የተገደበ የተሳታፊ ብዛት · 10 የተረጋገጡ አሸናፊዎች · 100% የቀጥታ ቪዲዮ",
      currencyStep: "1. የገንዘብ አይነት",
      ticketPriceStep: "2. የቲኬት ዋጋ",
      poolStep: "3. የተሳታፊ ብዛት",
      selectedPriceLabel: "የተመረጠው",
      ticketsCountLabel: "ቲኬቶች",
      payoutsTitle: "የምርጥ 3 ዋስትና ያላቸው ሽልማቶች",
      showAllPrizes: "ሁሉንም 10 ሽልማቶች አሳይ",
      hidePrizes: "ተጨማሪ ደረጃዎችን ደብቅ",
      summaryTitle: "የቀጥታ እጣ ማጠቃለያ",
      summaryBadge: "100% የቀጥታ ቪዲዮ",
      totalPrizePool: "ጠቅላላ የሽልማት መጠን",
      firstJackpot: "1ኛ ዋናው ታላቅ ጃክፖት",
      poolCapacity: "የተሳታፊዎች መጠን",
      winningOdds: "የማሸነፍ እድል",
      oddsValue: "1 በ 100 (ከፍተኛ እድል)",
      cashWinners: "የገንዘብ አሸናፊዎች",
      guaranteedCount: "10 የተረጋገጡ",
      drawBroadcast: "የእጣ ስርጭት ቀን",
      buyTicketBtn: "ቲኬት ይግዙ",
      howItWorksLink: "አሰራሩ እንዴት ነው?",
      pastResultsLink: "ያለፉ ውጤቶች",
      winners10Badge: "10 አሸናፊዎች",
      liveVideoBadge: "የቀጥታ ቪዲዮ",
      etbLabel: "ኢትዮጵያ ብር (ETB)",
      usdLabel: "የአሜሪካ ዶላር (USD)",
      etbSub: "ሀገር ውስጥ",
      usdSub: "ዲያስፖራ",
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
      badge: "100% ግልጽ የተሳታፊዎች ማረጋገጫ",
      title: "እውነተኛ አሸናፊዎች። ፈጣን የቪዲዮ ክፍያዎች።",
      subtitle: "ቁጥራቸው በቀጥታ ቪዲዮ ሲወጣ ከተመለከቱ እውነተኛ የሀገር ውስጥና የዲያስፖራ አሸናፊዎች በቀጥታ ይስሙ።",
      liveTicker: "የተረጋገጡ ክፍያዎች",
      verifiedPayout: "በቴሌብር የተከፈለ",
      won: "አሸነፈ/ች",
      draw: "እጣ",
      ticket: "ቲኬት #",
    },
    testimonialsSection: {
      badge: "የአሸናፊዎች አስተያየት",
      title: "የአሸናፊዎች አስተያየት",
      subtitle: "ከተረጋገጡ የሎተሪ አሸናፊዎች እውነተኛ ታሪኮች።",
      winnerStoriesTitle: "የአሸናፊዎች አስተያየት",
      communityTitle: "ይፋዊ ማህበረሰብ እና ማሳወቂያዎች",
      communityDesc: "አዲስ የጃክፖት እጣ ሲከፈት ወይም አሸናፊ ቁጥሮች በቀጥታ ቪዲዮ ሲወጡ ፈጣን የቴሌግራም እና የSMS ማሳወቂያዎችን ያግኙ።",
      joinAlertsBtn: "ማሳወቂያ ተቀላቀል",
      inputPlaceholder: "ኢሜይል ወይም ቴሌግራም @handle ያስገቡ",
      subscribedMsg: "ተመዝግበዋል! የእጣ ማሳወቂያዎች ይደርስዎታል።",
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
    howItWorksPage: {
      badge: "ሙሉ ግልጽነት እና የተሳታፊዎች መመሪያ",
      title: "የሪምና ዲጂታል ሎተሪ አሰራር",
      subtitle: "በ100% እውነተኛ ይፋዊ ግልጽነት ላይ የተገነባ። እድለኛ ቁጥሮችዎን እንዴት እንደሚመርጡ፣ ክፍያ እንደሚፈጽሙ፣ መስራቾቹ 10 አሸናፊዎችን በቀጥታ ቪዲዮ ሲያወጡ እንደሚከታተሉ እና ሽልማትዎን እንደሚቀበሉ ይማሩ።",
      chooseTicketCta: "አሁኑኑ ቲኬት ይቁረጡ",
      viewResultsCta: "የቀጥታና ያለፉ ውጤቶችን እይ",
      mathGuaranteeBadge: "100% የሂሳብ ዋስትና",
      scheduleTitle: "የምርጥ 10 አሸናፊዎች የሽልማት ሰንጠረዥ",
      payoutNoRolloverBadge: "100% ክፍያ / ያለ ማዘግየት",
      steps: [
        {
          stepNumber: "01",
          badge: "እጣዎን ይምረጡ",
          title: "እድለኛ ቁጥርዎን እና የተሳታፊ መጠን ይምረጡ",
          description: "ከ00 እስከ 99 የሚወዱትን ባለ 2-አሃዝ ቁጥር ይምረጡ ወይም በአጋጣሚ መራጭ ይጠቀሙ። የቲኬት ዋጋ (100፣ 200፣ 500፣ ወይም 1,000 ብር) እና የተሳታፊ ገደብ (1ሺህ፣ 2ሺህ፣ 3ሺህ፣ ወይም 5ሺህ) ይምረጡ።",
          highlights: [
            "የተገደበ የተሳታፊ መጠን የማሸነፍ እድልዎን ከፍ ያደርጋል (1 በ 100)።",
            "የጠቅላላ ሽልማቱን መጠን እና የ10 አሸናፊዎችን ሽልማት በቅጽበት ያሳያል።",
            "ልዩ የቲኬት መለያ ቁጥሮችን የያዘ ፈጣን ግዢ።",
          ],
        },
        {
          stepNumber: "02",
          badge: "ቀላል የሞባይል ክፍያ",
          title: "በቴሌብር ወይም በሲቢኢ ብር በቀላሉ ይክፈሉ",
          description: "በቴሌብር ወይም በሲቢኢ ብር በሰከንዶች ውስጥ ክፍያዎን ይፈጽሙ። ስልክ ቁጥርዎን ያስገቡ፣ ይክፈሉ፣ እና የተረጋገጠ ዲጂታል ቲኬትዎን ይቀበሉ።",
          highlights: [
            "የሚደገፉ፡ ቴሌብር፣ ሲቢኢ ብር፣ አዋሽ፣ አቢሲኒያ፣ ዳሸን፣ ቪዛ እና ማስተርካርድ።",
            "በ30 ሰከንድ ውስጥ ቲኬትዎን የሚያረጋግጥ ፈጣን ስርዓት።",
            "የSMS ማረጋገጫ እና ዲጂታል ቲኬት ደረሰኝ ይቀበሉ።",
          ],
        },
        {
          stepNumber: "03",
          badge: "100% ግልጽ የቀጥታ ስርጭት",
          title: "መስራቾቹ እጣ ሲያወጡ በቀጥታ ቪዲዮ ይመልከቱ",
          description: "ምንም ሚስጥራዊ የኮምፒውተር አልጎሪዝም የለም። የመድረኩ መስራቾች ሁሉንም አሸናፊ ቁጥሮች በቀጥታ ቪዲዮ ስርጭት ላይ በአካል ያወጣሉ። እያንዳንዱ ቁጥር በካሜራ ፊት በይፋ ይታያል።",
          highlights: [
            "በቴሌግራም እና በድረገጽ ላይ የታቀደ ይፋዊ የቀጥታ ቪዲዮ ስርጭት።",
            "መስራቾቹ አሸናፊ ኳሶቹን ከእጣ ማሽኑ ውስጥ በአካል ያወጣሉ።",
            "የቀጥታ ስርጭቱ ቪዲዮ በቋሚነት ተመዝግቦ ለድጋሚ እይታ ይቀመጣል።",
          ],
        },
        {
          stepNumber: "04",
          badge: "ዋስትና ያላቸው ሽልማቶች",
          title: "ምርጥ 10 የተረጋገጡ አሸናፊዎች ፈጣን ክፍያ ይቀበላሉ",
          description: "እያንዳንዱ እጣ ለ10 የተለያዩ አሸናፊዎች የ100% የሽልማት ገንዘብ ክፍያ ይፈጽማል። ሽልማቶች በደቂቃዎች ውስጥ ወደ ቴሌብር ወይም ባንክ ሂሳብዎ ይገባሉ።",
          highlights: [
            "1ኛ ደረጃ (ጃክፖት)፡ የጠቅላላ ሽልማቱ 30%።",
            "2ኛ ደረጃ፡ 20% · 3ኛ ደረጃ፡ 15% · 4ኛ ደረጃ፡ 8% · 5ኛ ደረጃ፡ 6%።",
            "ከ6ኛ እስከ 10ኛ ደረጃዎች፡ 4% እስከ 5% የተረጋገጠ የገንዘብ ክፍያ።",
          ],
        },
      ],
      scheduleTiers: [
        { rank: "#1 ታላቁ ጃክፖት", share: "የእጣው 30%", desc: "ዋናው የገንዘብ / የቅንጦት ሽልማት" },
        { rank: "#2 የቅንጦት ሽልማት", share: "የእጣው 20%", desc: "ከፍተኛ የተረጋገጠ ገንዘብ" },
        { rank: "#3 ከፍተኛ ሽልማት", share: "የእጣው 15%", desc: "የተረጋገጠ የገንዘብ ክፍያ" },
        { rank: "#4 የገንዘብ አሸናፊ", share: "የእጣው 8%", desc: "ቀጥታ የባንክ ዝውውር" },
        { rank: "#5 የገንዘብ አሸናፊ", share: "የእጣው 6%", desc: "ቀጥታ የባንክ ዝውውር" },
        { rank: "#6 የገንዘብ አሸናፊ", share: "የእጣው 5%", desc: "ቀጥታ የባንክ ዝውውር" },
        { rank: "#7–#10 (4 አሸናፊዎች)", share: "እያንዳንዳቸው 4% (16%)", desc: "ፈጣን የሞባይል ክፍያ" },
      ],
    },
    resultsPage: {
      badge: "ይፋዊ የተረጋገጡ ውጤቶች እና ስርጭት",
      title: "ይፋዊ የቀጥታ እጣ ውጤቶች",
      subtitle: "ሁሉም 10 አሸናፊዎች በመስራቾቹ በቀጥታ ቪዲዮ ስርጭት ይወጣሉ። ይፋዊ እድለኛ ቁጥሮችን፣ የተረጋገጡ ሽልማቶችን እና የቀጥታ ቪዲዮ ድጋሚ እይታዎችን ይመልከቱ።",
      latestAuditBadge: "የቅርብ ጊዜ የተጠናቀቀ እጣ ማረጋገጫ",
      winningNumbersTitle: "ምርጥ 10 አሸናፊ ቁጥሮች",
      auditedBadge: "10 የተረጋገጡ አሸናፊዎች",
      payoutNotice: "ሁሉም ክፍያዎች የቀጥታ እጣው ከተጠናቀቀ በ30 ደቂቃዎች ውስጥ ወደ አሸናፊው የCBE ወይም የቴሌብር ሂሳብ ይተላለፋሉ።",
      supportBadge: "ስለ ሽልማት መቀበል እገዛ ይፈልጋሉ?",
      supportTitle: "የቀጥታ ድጋፍ 24/7 የስልክ መስመር",
      supportDesc: "የደንበኞች አገልግሎት ቡድናችን አሸናፊ ቲኬቶችን ያረጋግጣል እንዲሁም በቴሌብር እና በሲቢኢ ክፍያዎች ላይ ሙሉ ድጋፍ ይሰጣል።",
      callBtn: "ስልክ ይደውሉ",
      telegramBtn: "የቴሌግራም ቻናል",
      rankLabels: {
        first: "🥇 1ኛ (ጃክፖት)",
        second: "🥈 2ኛ ደረጃ",
        third: "🥉 3ኛ ደረጃ",
        other: "ደረጃ #",
      },
    },
    aboutPage: {
      badge: "የኢትዮጵያ እና የዲያስፖራ ግልጽ ሎተሪ",
      title: "ለምን ሪምና ዲጂታል ሎተሪ?",
      subtitle: "በእውነተኛ ይፋዊ ግልጽነት፣ በተገደበ የተሳታፊ መጠን እና በእያንዳንዱ እጣ በ10 የተረጋገጡ አሸናፊዎች ላይ የተገነባ የኢትዮጵያ እና የዲያስፖራ ግንባር ቀደም ዲጂታል ሎተሪ።",
      pickNumberCta: "እድለኛ ቁጥር ይምረጡ",
      readGuideCta: "ሙሉ መመሪያውን ያንብቡ",
      careBadge: "24/7 የተሟላ የደንበኞች አገልግሎት",
      careTitle: "ይፋዊ የተሳታፊዎች ድጋፍ እና ማረጋገጫ",
      careDesc: "ስለ ቲኬት ማረጋገጫ፣ የክፍያ ዘዴዎች፣ ወይም ሽልማት መቀበል ጥያቄ አለዎት? ቡድናችን በቀን 24 ሰዓት ዝግጁ ነው።",
      callBtn: "ይደውሉልን",
      telegramBtn: "ቴሌግራም ይቀላቀሉ",
    },
    entriesPage: {
      badge: "የእኔ ይፋዊ የሎተሪ ቲኬቶች",
      title: "የገዛኋቸው ቲኬቶች",
      subtitle: "ንቁ ቲኬቶችዎን፣ የተረጋገጡ ቁጥሮችዎን እና የቀጥታ እጣ ሁኔታዎችን ይከታተሉ።",
      playerProfile: "የተጫዋች መለያ",
      verifiedBadge: "የተረጋገጠ የቲኬት ባለቤት",
      statsTotal: "ጠቅላላ ቲኬቶች",
      statsActive: "በቀጥታ እጣ ላይ ያሉ",
      statsPending: "ማረጋገጫ በመጠባበቅ ላይ",
      statsWins: "የተረጋገጡ ሽልማቶች",
      tabAll: "ሁሉም ቲኬቶች",
      tabActive: "የተረጋገጡ እና ንቁ",
      tabPending: "ማረጋገጫ የሚጠብቁ",
      receiptPreview: "የክፍያ ደረሰኝ ይመልከቱ",
      drawRef: "የእጣ መለያ ኮድ",
      luckyNumberBadge: "እድለኛ ቁጥር",
      poolTier: "የተሳታፊ መጠን",
      searchPlaceholder: "በእጣ ኮድ ወይም በእድለኛ ቁጥር ይፈልጉ...",
      filterStatus: "ሁሉም ሁኔታዎች",
      liveBroadcastNotice: "100% የቀጥታ የቪዲዮ ስርጭት እጣ",
      loginTitle: "ቲኬቶችዎን ለማየት ይግቡ",
      loginDesc: "የገዟቸውን የተረጋገጡ ቲኬቶች በሙሉ ለመመልከት በቲኬት ግዢ ወቅት የተጠቀሙበትን ስልክ ቁጥር ያስገቡ።",
      phoneLabel: "ስልክ ቁጥር (ለምሳሌ 0911000000)",
      nameLabel: "የእርስዎ ስም (አስገዳጅ አይደለም)",
      signInBtn: "ቲኬቶቼን አሳይ",
      emptyTitle: "ምንም ቲኬት አልተገኘም",
      emptyDesc: "እስካሁን ምንም ቲኬት አልገዙም። በእንቅስቃሴ ላይ ባለው እጣችን እድለኛ ቁጥርዎን ይምረጡና ትልቅ ሽልማት ያሸንፉ!",
      buyFirstBtn: "የመጀመሪያ ቲኬትዎን ይግዙ",
      myTicketsTitle: "የተረጋገጡ ቲኬቶች",
      refreshBtn: "ቲኬቶችን አድስ",
      signOutBtn: "ውጣ",
      statusPending: "ማረጋገጫ በመጠባበቅ ላይ",
      statusConfirmed: "የተረጋገጠ እና ንቁ",
      statusRejected: "ክፍያው ውድቅ ሆኗል",
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

  // ─── 3. TIGRINYA (ትግርኛ / Tigray) ──────────────────────────────────
  ti: {
    appName: "ሪምና ዲጂታል ሎተሪ",
    tagline: "ብናይ ቀጥታ ቪድዮ ዕጫ ዝወጸሉን ብተኣማንነት ዝተረጋገጸን ዲጂታል ሎተሪ",
    nav: {
      draws: "ዕጫታት",
      enter: "ቲኬት ዓድጉ",
      myEntries: "ናተይ ቲኬታት",
      results: "ውጽኢታት",
      admin: "ናይ ምምሕዳር ፖርታል",
      howItWorks: "ኣሰራርሕኡ ብኸመይ እዩ?",
      whyRimna: "ስለምንታይ ሪምና?",
      eventsDeals: "ፍሉይ መደባትን ቅናሳትን",
      contact: "ርኸቡና",
      officialTelegram: "ወግዓዊ ቴሌግራም:",
      hotline247: "ናይ 24/7 መስመር:",
      signIn: "እተዉ",
      signOut: "ውጹ",
    },
    hero: {
      liveBadge: "100% ናይ ቀጥታ ቪድዮ ዕጫ · ዝተረጋገጸ ፈነወ",
      title: "ናይ ኢትዮጵያ ዝዓበየ ናይ ቀጥታ ዲጂታል ጃክፖት ተዓወቱ",
      subtitle: "ካብ 00 ክሳብ 99 ዝፈትውዎ ቁጽሪ ምረጹ፣ ብቴሌብር ወይ ብሲቢኢ ብር ክፈሉ፣ ኣብ መዓልቲ ዕጫ ናይ ቀጥታ ቪድዮ ዕጫ ተኸታተሉ። 100% ግልጺን ውሑስን።",
      enterCta: "ዕጫ መርሚርኩም ተሳተፉ",
      resultsCta: "ውጽኢት ርኣዩ",
      exploreDraws: "ኩሎም ዕጫታት ርኣዩ",
      closesIn: "ዕጫ ንምዕጻው ዝተረፈ ግዜ",
      drawDay: "ዕለተ ዕጫ",
      trustBadge: "100% ናይ ቀጥታ ቪድዮ ዕጫ · ዝተረጋገጸ ፈነወ",
      guaranteedWinnersBadge: "10 ውሑሳት ተዓወትቲ",
      oddsBadge: "ልዑል ናይ ምዕዋት ዕድል (1 ኣብ 100)",
      cardTitle: "ኣብ ነፍሲ ወከፍ ዕጫ 100% ውሑስ ናይ ገንዘብ ክፍሊት",
      cardDesc: "ምንም ናይ ምድንጓይ ምግፋሕ የለን። ነፍሲ ወከፍ ዕጫ ኣብ ውሽጢ 30 ደቒቕ ን10 ተዓወትቲ ብቐጥታ ቪድዮ ይኽፈል。",
      cardCta: "ናይ ቀጥታ ዕጫታት ርኣዩ",
    },
    promo: {
      badge: "ፍሉያት ሽልማታትን መወዓውዒታትን",
      viewAllDeals: "ኩሎም ሽልማታት ርኣዩ",
      exclusive: "ናይ በዓል ፍሉይ ጃክፖት",
      limitedTime: "ውሱን ናይ ተሳተፍቲ ቁጽሪ",
      getDeal: "ዕድልኩም ተጠቐሙ",
    },
    adsSection: {
      badge: "ዝመጹ ሎተሪታትን ዓበይቲ ሽልማታትን",
      title: "ዓበይቲ ናይ ጃክፖት ሽልማታትን ኣብ ቀረባ ዝመጹ ዕጫታትን",
      hoverToPause: "ንምዕራፍ ማውስ ኣቐምጡ",
      resumeScroll: "ምንቅስቓስ ቀጽል",
      upcomingPool: "ኣብ ቀረባ ዝኽፈት ወግዓዊ ዕጫ",
      comingSoon: "ኣብ ቀረባ ተጸበዩ",
      stayTuned: "ተኸታተሉ",
      videoDraw: "100% ናይ ቀጥታ ቪድዮ ዕጫ",
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
    configurator: {
      title: "ናይ ቲኬት መመርጺን መስተኻኸሊን ሰሌዳ",
      subtitle: "ውሱን ቁጽሪ ተሳተፍቲ · 10 ውሑሳት ተዓወትቲ · 100% ናይ ቀጥታ ቪድዮ",
      currencyStep: "1. ዓይነት ገንዘብ",
      ticketPriceStep: "2. ዋጋ ቲኬት",
      poolStep: "3. መጠን ተሳተፍቲ",
      selectedPriceLabel: "ዝተመረጸ",
      ticketsCountLabel: "ቲኬታት",
      payoutsTitle: "ናይ ቀዳሞት 3 ውሑሳት ሽልማታት",
      showAllPrizes: "ኩሎም 10 ሽልማታት ኣርኢ",
      hidePrizes: "ተወሳኺ ደረጃታት ሕባእ",
      summaryTitle: "ናይ ቀጥታ ዕጫ ጽሟቕ",
      summaryBadge: "100% ናይ ቀጥታ ቪድዮ",
      totalPrizePool: "ጠቕላላ መጠን ሽልማት",
      firstJackpot: "1ይ ዋና ዓቢይ ጃክፖት",
      poolCapacity: "መጠን ተሳተፍቲ",
      winningOdds: "ናይ ምዕዋት ዕድል",
      oddsValue: "1 ኣብ 100 (ልዑል ዕድል)",
      cashWinners: "ናይ ገንዘብ ተዓወትቲ",
      guaranteedCount: "10 ውሑሳት",
      drawBroadcast: "ዝፍነወሉ ዕለት",
      buyTicketBtn: "ቲኬት ዓድጉ",
      howItWorksLink: "ኣሰራርሕኡ ብኸመይ እዩ?",
      pastResultsLink: "ዝሓለፉ ውጽኢታት",
      winners10Badge: "10 ተዓወትቲ",
      liveVideoBadge: "ናይ ቀጥታ ቪድዮ",
      etbLabel: "ናይ ኢትዮጵያ ብር (ETB)",
      usdLabel: "ናይ ኣመሪካ ዶላር (USD)",
      etbSub: "ናይ ዓዲ ውሽጢ",
      usdSub: "ዲያስፖራ",
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
      badge: "100% ግልጺ ናይ ተሳተፍቲ መርትዖ",
      title: "ናይ ሓቂ ተዓወትቲ። ቅልጡፍ ናይ ቪድዮ ክፍሊት።",
      subtitle: "ቁጽሮም ብቐጥታ ቪድዮ ክወጽእ ዝተዓዘቡ ናይ ውሽጢ ዓድን ዲያስፖራን ተዓወትቲ ብቐጥታ ስምዑ።",
      liveTicker: "ዝተረጋገጹ ክፍሊታት",
      verifiedPayout: "ብቴሌብር ዝተከፍለ",
      won: "ተዓዊቱ/ታ",
      draw: "ዕጫ",
      ticket: "ቲኬት #",
    },
    testimonialsSection: {
      badge: "ናይ ተዓወትቲ ርእይቶ",
      title: "ናይ ተዓወትቲ ርእይቶ",
      subtitle: "ካብ ዝተረጋገጹ ናይ ሎተሪ ተዓወትቲ ናይ ሓቂ ታሪኽ።",
      winnerStoriesTitle: "ናይ ተዓወትቲ ርእይቶ",
      communityTitle: "ወግዓዊ ማሕበረሰብን ምልክታታትን",
      communityDesc: "ሓዱሽ ናይ ጃክፖት ዕጫ ክኽፈት ከሎ ወይ ተዓወቲ ቁጽርታት ብቐጥታ ቪድዮ ክወጹ ከለዉ ቅልጡፍ ናይ ቴሌግራምን SMSን ምልክታታት ርኸቡ።",
      joinAlertsBtn: "ምልክታ ተጸንበሩ",
      inputPlaceholder: "ኢመይል ወይ ቴሌግራም @handle ኣእትዉ",
      subscribedMsg: "ተመዝጊብኩም ኣለኹም! ናይ ዕጫ ምልክታታት ክበጽሓኩም እዩ።",
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
    howItWorksPage: {
      badge: "ምሉእ ግልጽነትን ናይ ተሳተፍቲ መምርሒን",
      title: "ናይ ሪምና ዲጂታል ሎተሪ ኣሰራርሓ",
      subtitle: "ብ100% ናይ ሓቂ ወግዓዊ ግልጽነት ዝተሃነጸ። ዕድለኛ ቁጽርታትኩም ከመይ ከም እትመርጹ፣ ክፍሊት ከም እትፍጽሙ፣ መስረትቲ 10 ተዓወትቲ ብቐጥታ ቪድዮ ከውጽኡ ከለዉ ከም እትከታተሉን ሽልማትኩም ከም እትቕበሉን ተማሃሩ።",
      chooseTicketCta: "ሕጂ ቲኬት ዓድጉ",
      viewResultsCta: "ናይ ቀጥታን ዝሓለፉን ውጽኢታት ርኣዩ",
      mathGuaranteeBadge: "100% ናይ ሒሳብ ውሕስነት",
      scheduleTitle: "ናይ ቀዳሞት 10 ተዓወትቲ ናይ ሽልማት ሰሌዳ",
      payoutNoRolloverBadge: "100% ክፍሊት / ብዘይ ምድንጓይ",
      steps: [
        {
          stepNumber: "01",
          badge: "ዕጫኹም ምረጹ",
          title: "ዕድለኛ ቁጽርኹምን መጠን ተሳተፍትን ምረጹ",
          description: "ካብ 00 ክሳብ 99 ዝፈትውዎ ባለ 2-ኣሃዝ ቁጽሪ ምረጹ ወይ ብዕጫ መውጽኢ ተጠቐሙ። ዋጋ ቲኬት (100፣ 200፣ 500፣ ወይ 1,000 ብር) ከምኡ'ውን መጠን ተሳተፍቲ (1ሺሕ፣ 2ሺሕ፣ 3ሺሕ፣ ወይ 5ሺሕ) ምረጹ።",
          highlights: [
            "ውሱን መጠን ተሳተፍቲ ናይ ምዕዋት ዕድልኩም ልዑል ይገብሮ (1 ኣብ 100)።",
            "ጠቕላላ መጠን ሽልማትን ናይ 10 ተዓወትቲ ሽልማትን ብቕጽበት የርኢ።",
            "ፍሉይ ናይ ቲኬት መፍለዪ ቁጽርታት ዝሓዘ ቅልጡፍ ዕዳጋ።",
          ],
        },
        {
          stepNumber: "02",
          badge: "ቀሊል ናይ ሞባይል ክፍሊት",
          title: "ብቴሌብር ወይ ብሲቢኢ ብር ብቐሊሉ ክፈሉ",
          description: "ብቴሌብር ወይ ሲቢኢ ብር ብሰከንዶች ውሽጢ ክፍሊትኩም ፈጽሙ። ቁጽሪ ስልክኹም ኣእትዉ፣ ክፈሉ፣ ዝተረጋገጸ ዲጂታል ቲኬትኩም ተቐበሉ።",
          highlights: [
            "ዝድገፉ፡ ቴሌብር፣ ሲቢኢ ብር፣ ኣዋሽ፣ ኣቢሲንያ፣ ዳሽን፣ ቪዛን ማስተርካርድን።",
            "ኣብ ውሽጢ 30 ሰከንድ ቲኬትኩም ዘረጋግጽ ቅልጡፍ ስርዓት።",
            "ናይ SMS ምርግጋጽን ዲጂታል ቲኬት ደረሰኝን ተቐበሉ።",
          ],
        },
        {
          stepNumber: "03",
          badge: "100% ግልጺ ናይ ቀጥታ ፈነወ",
          title: "መስረትቲ ዕጫ ከውጽኡ ከለዉ ብቐጥታ ቪድዮ ተኸታተሉ",
          description: "ዝኾነ ዝተሓብአ ናይ ኮምፒውተር ኣሰራርሓ የለን። ናይቲ መድረኽ መስረትቲ ኩሎም ተዓወቲ ቁጽርታት ብቐጥታ ቪድዮ ፈነወ ብኣካል የውጽኡ። ነፍሲ ወከፍ ቁጽሪ ኣብ ቅድሚ ካሜራ ብወግዒ ይርአ።",
          highlights: [
            "ብቴሌግራምን ኣብ መርበብ ሓበሬታን ዝፍኖ ወግዓዊ ናይ ቀጥታ ቪድዮ ፈነወ።",
            "መስረትቲ ተዓወቲ ኲዕሶታት ካብቲ ናይ ዕጫ ማሽን ብኣካል የውጽኡ።",
            "ናይቲ ፈነወ ቪድዮ ንሓዋሩ ተመዝጊቡ ንተወሳኺ ምዕዛብ ይቕመጥ።",
          ],
        },
        {
          stepNumber: "04",
          badge: "ውሑሳት ሽልማታት",
          title: "ቀዳሞት 10 ዝተረጋገጹ ተዓወትቲ ቅልጡፍ ክፍሊት ይረኽቡ",
          description: "ነፍሲ ወከፍ ዕጫ ን10 ዝተፈላለዩ ተዓወትቲ ናይ 100% ናይ ሽልማት ገንዘብ ክፍሊት ይፍጽም። ሽልማታት ኣብ ውሽጢ ደቓይቕ ናብ ቴሌብር ወይ ባንክ ሕሳብኩም ይኣቱ።",
          highlights: [
            "1ይ ደረጃ (ጃክፖት)፡ ናይቲ ጠቕላላ ሽልማት 30%።",
            "2ይ ደረጃ፡ 20% · 3ይ ደረጃ፡ 15% · 4ይ ደረጃ፡ 8% · 5ይ ደረጃ፡ 6%።",
            "ካብ 6ይ ክሳብ 10ይ ደረጃታት፡ 4% ክሳብ 5% ውሑስ ናይ ገንዘብ ክፍሊት።",
          ],
        },
      ],
      scheduleTiers: [
        { rank: "#1 ዓቢይ ጃክፖት", share: "ናይቲ ዕጫ 30%", desc: "ዋና ናይ ገንዘብ / ናይ ቅንጦት ሽልማት" },
        { rank: "#2 ናይ ቅንጦት ሽልማት", share: "ናይቲ ዕጫ 20%", desc: "ልዑል ዝተረጋገጸ ገንዘብ" },
        { rank: "#3 ላዕለዋይ ሽልማት", share: "ናይቲ ዕጫ 15%", desc: "ዝተረጋገጸ ናይ ገንዘብ ክፍሊት" },
        { rank: "#4 ናይ ገንዘብ ተዓዋቲ", share: "ናይቲ ዕጫ 8%", desc: "ቀጥታ ናይ ባንክ ምስግጋር" },
        { rank: "#5 ናይ ገንዘብ ተዓዋቲ", share: "ናይቲ ዕጫ 6%", desc: "ቀጥታ ናይ ባንክ ምስግጋር" },
        { rank: "#6 ናይ ገንዘብ ተዓዋቲ", share: "ናይቲ ዕጫ 5%", desc: "ቀጥታ ናይ ባንክ ምስግጋር" },
        { rank: "#7–#10 (4 ተዓወትቲ)", share: "ነፍሲ ወከፎም 4% (16%)", desc: "ቅልጡፍ ናይ ሞባይል ክፍሊት" },
      ],
    },
    resultsPage: {
      badge: "ወግዓዊ ዝተረጋገጹ ውጽኢታትን ፈነወን",
      title: "ወግዓዊ ናይ ቀጥታ ዕጫ ውጽኢታት",
      subtitle: "ኩሎም 10 ተዓወትቲ ብመስረትቲ ብቐጥታ ቪድዮ ፈነወ ይወጹ። ወግዓዊ ዕድለኛ ቁጽርታት፣ ዝተረጋገጹ ሽልማታትን ናይ ቪድዮ ድጋመታትን ርኣዩ።",
      latestAuditBadge: "ናይ ቀረባ ግዜ ዝተዛዘመ ናይ ዕጫ ምርግጋጽ",
      winningNumbersTitle: "ቀዳሞት 10 ተዓወቲ ቁጽርታት",
      auditedBadge: "10 ውሑሳት ተዓወትቲ ተረጋጊጾም",
      payoutNotice: "ኩሎም ክፍሊታት ናይ ቀጥታ ዕጫ ምስ ተዛዘመ ኣብ ውሽጢ 30 ደቓይቕ ናብ ናይቲ ተዓዋቲ ናይ CBE ወይ ቴሌብር ሕሳብ ይተሓላለፉ።",
      supportBadge: "ብዛዕባ ሽልማት ምቕባል ሓገዝ ትደልዩ ዶ?",
      supportTitle: "ናይ ቀጥታ ደገፍ 24/7 ናይ ስልኪ መስመር",
      supportDesc: "ናይ ዓማዊል ኣገልግሎት ጉጅለና ተዓወቲ ቲኬታት የረጋግጽ ከምኡ'ውን ብቴሌብርን ሲቢኢን ኣብ ዝግበሩ ክፍሊታት ምሉእ ሓገዝ ይህብ።",
      callBtn: "ስልኪ ደውሉ",
      telegramBtn: "ናይ ቴሌግራም ቻናል",
      rankLabels: {
        first: "🥇 1ይ (ጃክፖት)",
        second: "🥈 2ይ ደረጃ",
        third: "🥉 3ይ ደረጃ",
        other: "ደረጃ #",
      },
    },
    aboutPage: {
      badge: "ናይ ኢትዮጵያን ዲያስፖራን ግልጺ ሎተሪ",
      title: "ስለምንታይ ሪምና ዲጂታል ሎተሪ?",
      subtitle: "ብናይ ሓቂ ወግዓዊ ግልጽነት፣ ብውሱን መጠን ተሳተፍትን ኣብ ነፍሲ ወከፍ ዕጫ ብ10 ውሑሳት ተዓወትትን ዝቖመ ናይ ኢትዮጵያን ዲያስፖራን ቀዳማይ ዲጂታል ሎተሪ።",
      pickNumberCta: "ዕድለኛ ቁጽሪ ሕጂ ምረጹ",
      readGuideCta: "ምሉእ መምርሒ ኣንብቡ",
      careBadge: "24/7 ዝተማልአ ናይ ዓማዊል ክንክን",
      careTitle: "ወግዓዊ ናይ ተሳተፍቲ ሓገዝን ምርግጋጽን",
      careDesc: "ብዛዕባ ምርግጋጽ ቲኬት፣ ናይ ክፍሊት መንገድታት፣ ወይ ሽልማት ምቕባል ሕቶታት ኣለኩም ዶ? ጉጅለና ኣብ መዓልቲ 24 ሰዓታት ድሉው እዩ።",
      callBtn: "ደውሉልና",
      telegramBtn: "ቴሌግራም ተጸንበሩ",
    },
    entriesPage: {
      badge: "ናተይ ወግዓዊ ናይ ሎተሪ ቲኬታት",
      title: "ዝዓደግክዎም ቲኬታት",
      subtitle: "ንቑሓት ቲኬታትኩም፣ ዝተረጋገጹ ቁጽርታትኩምን ናይ ቀጥታ ዕጫ ኩነታትን ተኸታተሉ።",
      playerProfile: "ናይ ተጻዋታይ መለያ",
      verifiedBadge: "ዝተረጋገጸ ናይ ቲኬት ወናኒ",
      statsTotal: "ጠቕላላ ቲኬታት",
      statsActive: "ኣብ ቀጥታ ዕጫ ዘለዉ",
      statsPending: "ምርግጋጽ ዝጽበዩ",
      statsWins: "ዝተረጋገጹ ሽልማታት",
      tabAll: "ኩሎም ቲኬታት",
      tabActive: "ዝተረጋገጹን ንቑሓትን",
      tabPending: "ምርግጋጽ ዝጽበዩ ዘለዉ",
      receiptPreview: "ናይ ክፍሊት ደረሰኝ ርኣዩ",
      drawRef: "ናይ ዕጫ መፍለዪ ኮድ",
      luckyNumberBadge: "ዕድለኛ ቁጽሪ",
      poolTier: "መጠን ተሳተፍቲ",
      searchPlaceholder: "ብናይ ዕጫ ኮድ ወይ ዕድለኛ ቁጽሪ ድለዩ...",
      filterStatus: "ኩሎም ኩነታት",
      liveBroadcastNotice: "100% ብቀጥታ ቪድዮ ዝካየድ ፈነወ ዕጫ",
      loginTitle: "ቲኬታትኩም ንምርኣይ እተዉ",
      loginDesc: "ኩሎም ዝዓደግክዎም ዝተረጋገጹ ቲኬታት ንምርኣይ ኣብ እዋን ዕዳጋ ቲኬት ዝተጠቐምኩምሉ ቁጽሪ ስልኪ ኣእትዉ።",
      phoneLabel: "ቁጽሪ ስልኪ (ንኣብነት 0911000000)",
      nameLabel: "ስምኩም (ኣማራጺ)",
      signInBtn: "ቲኬታተይ ኣርኢ",
      emptyTitle: "ዝኾነ ቲኬት ኣይተረኽበን",
      emptyDesc: "ክሳብ ሕጂ ዝኾነ ቲኬት ኣይዓደግኩምን። ኣብቲ ንቑሕ ዕጫና ዕድለኛ ቁጽርኹም መሪጽኩም ዓቢይ ሽልማት ተዓወቱ!",
      buyFirstBtn: "ቀዳማይ ቲኬትኩም ዓድጉ",
      myTicketsTitle: "ዝተረጋገጹ ቲኬታት",
      refreshBtn: "ቲኬታት ኣሐድስ",
      signOutBtn: "ውጻእ",
      statusPending: "ምርግጋጽ ይጽበ ኣሎ",
      statusConfirmed: "ዝተረጋገጸን ንቑሕን",
      statusRejected: "ክፍሊት ተነጺጉ",
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
