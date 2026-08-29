export type Language = "en" | "am" | "om";

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
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "Rimna Digital Lottery",
    tagline: "Provably Fair Digital Lottery & Raffles",
    nav: {
      draws: "Draws",
      enter: "Buy Ticket",
      myEntries: "My Tickets",
      results: "Results",
      admin: "Admin Portal",
      howItWorks: "How It Works",
      eventsDeals: "Events & Deals",
    },
    hero: {
      liveBadge: "ACTIVE DRAW · ENTRIES OPEN",
      title: "One Dream Villa. One Electric SUV. Eight More Life-Changing Rewards.",
      subtitle: "Pick a number from 00 to 99, secure your ticket via Telebirr or CBE Birr, and verify the cryptographic seed on draw day. 100% auditable and trustless.",
      enterCta: "Enter Active Draw",
      resultsCta: "Verify Fairness",
      exploreDraws: "Explore All Draws",
      closesIn: "Entries close in",
      drawDay: "Draw Schedule",
      trustBadge: "Verifiable SHA-256 Commit-Reveal Protocol",
    },
    promo: {
      badge: "FEATURED EVENT & DEALS",
      viewAllDeals: "View Special Events",
      exclusive: "Holiday Jackpot Special",
      limitedTime: "Limited Time Bonus",
      getDeal: "Claim Offer",
    },
    drawsExplorer: {
      title: "Digital Raffle Catalog",
      subtitle: "Explore current live prize pools, upcoming scheduled raffles, and historical audited results.",
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
      verifyResults: "Audit Seed & Results",
      startsIn: "Opens In",
      completedOn: "Completed On",
      noDrawsFound: "No draws match your selection.",
      filterBy: "Filter by status",
      statusOpen: "Live & Open",
      statusUpcoming: "Scheduled Soon",
      statusRevealed: "Audited & Completed",
      seedHash: "Commitment Hash",
    },
    prizes: {
      title: "Prize Table & Rankings",
      subtitle: "Guaranteed payouts awarded to winning numbers from Rank 1 down to Rank 10.",
      rank1: "1st Place",
      rank2: "2nd Place",
      rank3: "3rd Place",
      rankOther: "Place",
      tierGrand: "Grand Prize Tier",
      tierMajor: "Major Prize Tier",
      tierStandard: "Cash Rewards Tier",
    },
    quickPick: {
      title: "Interactive Number Selector",
      subtitle: "Select any lucky two-digit number (00–99) or generate a cryptographically balanced random pick.",
      selectedNumber: "Selected Number",
      randomPick: "Random Pick",
      checkOdds: "Test Availability",
      instantEnter: "Proceed With Number",
      hint: "Every two-digit number has an equal mathematical probability. Earlier confirmed payment wins rank in case of duplicates.",
      availability: "Status",
      available: "Available",
      taken: "Taken (Tie-breaker applies)",
    },
    fairness: {
      title: "Cryptographic Transparency",
      subtitle: "Our commit-reveal protocol ensures the winning numbers can never be tampered with by organizers or participants.",
      step1Title: "1. Pre-Commitment",
      step1Desc: "A 32-byte secret random seed is generated before entries open. Its SHA-256 fingerprint is published publicly.",
      step2Title: "2. Sealed Entries",
      step2Desc: "All player ticket choices and payments are recorded and locked when the countdown expires.",
      step3Title: "3. Public Reveal & Audit",
      step3Desc: "The secret seed is published on draw day. The formula calculates winners deterministically in your browser.",
      verifyBtn: "Open Client-Side Verifier",
      algoTitle: "Mathematical Derivation Algorithm",
      formula: "winner_rank = parseInt(SHA256(seed + ':' + drawID + ':' + rank).slice(0, 8), 16) % 100",
    },
    winners: {
      title: "Recent Verified Winners",
      subtitle: "Real-time stream of confirmed payouts distributed to authenticated ticket holders.",
      liveTicker: "Verified Payouts",
      verifiedPayout: "Paid & Audited",
      won: "won",
      draw: "Draw",
      ticket: "Ticket #",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "A seamless, three-step physical-to-digital raffle experience.",
      step1: "1. Pick Your Number",
      step1Desc: "Choose your lucky number between 00 and 99, or use the quick random generator.",
      step2: "2. Complete Payment",
      step2Desc: "Pay ticket cost securely through Telebirr, CBE Birr, or direct bank transfer and upload your receipt screenshot.",
      step3: "3. Live Draw & Verification",
      step3Desc: "On draw day, winning numbers are derived publicly. Claim prizes instantly and verify the SHA-256 fingerprint.",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about security, fairness, and prize collection.",
    },
    footer: {
      description: "PrimeDraws is a next-generation digital raffle platform engineered with cryptographic fairness, automated audit logging, and direct mobile wallet payouts.",
      rights: "All rights reserved. Digital Lottery Operations.",
      support: "Support Hotline: +251 911 000 000 · support@primedraws.com",
      compliance: "Fully verified transactions · 100% Client-Side Auditable Proofs",
      transparency: "Open Transparency",
      quickLinks: "Platform Navigation",
      social: "Community Channels",
    },
  },

  am: {
    appName: "ሪምና ዲጂታል ሎተሪ",
    tagline: "በሳይንሳዊ እና በክሪፕቶግራፊ የተረጋገጠ ዲጂታል ሎተሪ",
    nav: {
      draws: "ድሎች እና እጣዎች",
      enter: "እጣ ይግዙ",
      myEntries: "የእኔ ቲኬቶች",
      results: "የእጣ ውጤቶች እና ማረጋገጫ",
      admin: "የአስተዳዳሪ ፖርታል",
      howItWorks: "አሰራሩ እንዴት ነው?",
      eventsDeals: "ልዩ ዝግጅቶችና ቅናሾች",
    },
    hero: {
      liveBadge: "የቀጥታ እጣ · ቲኬት ግዢ ክፍት ነው",
      title: "አንድ ዘመናዊ ቪላ። አንድ የኤሌክትሪክ መኪና። ስምንት ሌሎች ከፍተኛ ሽልማቶች።",
      subtitle: "ከ00 እስከ 99 የሚወዱትን ቁጥር ይምረጡ፣ በቴሌብር ወይም በሲቢኢ ብር ይክፈሉ፣ በእጣው ቀን የማረጋገጫ ሚስጥር ኮዱን ራሶት ያረጋግጡ። 100% ግልጽና አስተማማኝ።",
      enterCta: "አሁኑኑ ይሳተፉ",
      resultsCta: "ውጤቱን ያረጋግጡ",
      exploreDraws: "ሁሉንም እጣዎች ይመልከቱ",
      closesIn: "እጣው ለመዘጋት የቀረው ጊዜ",
      drawDay: "የእጣ መውጫ ቀን",
      trustBadge: "በSHA-256 ክሪፕቶግራፊ የታመነ አሰራር",
    },
    promo: {
      badge: "ልዩ ዝግጅቶች እና ማስታወቂያዎች",
      viewAllDeals: "ሁሉንም ይመልከቱ",
      exclusive: "የበዓል ልዩ ጃክፖት",
      limitedTime: "ለተወሰነ ጊዜ ብቻ የቀረበ",
      getDeal: "ዕድሉን ይጠቀሙ",
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
      seedHash: "የማረጋገጫ ሃሽ ኮድ",
    },
    prizes: {
      title: "የሽልማት ደረጃዎችና ሰንጠረዥ",
      subtitle: "ከደረጃ 1 እስከ ደረጃ 10 ላሉ አሸናፊ ቁጥሮች የሚሰጡ የተረጋገጡ ሽልማቶች።",
      rank1: "1ኛ ደረጃ",
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
      title: "የማረጋገጫና የታማኝነት ስርዓት",
      subtitle: "የእጣው ውጤት ማንም ሰው ሊቀይረው ወይም ሊያጭበረብረው በማይችል የሂሳብ ቀመር ይሰራል::",
      step1Title: "1. አስቀድሞ መቆለፍ",
      step1Desc: "እጣው ከመከፈቱ በፊት 32-ባይት ሚስጥራዊ ቁጥር ተዘጋጅቶ የSHA-256 አሻራው በይፋ ይታተማል።",
      step2Title: "2. ቲኬቶችን ማሰባሰብ",
      step2Desc: "የተሳታፊዎች ቁጥሮች እና ክፍያዎች ተረጋግጠው እጣው እስኪዘጋ ድረስ በስርዓቱ ይቀመጣሉ።",
      step3Title: "3. ይፋ ማድረግ እና ማረጋገጥ",
      step3Desc: "በእጣው ቀን ሚስጥራዊው ቁጥር ይፋ ሲደረግ በራስዎ ብሮውዘር ላይ ትክክለኛነቱን ማረጋገጥ ይችላሉ።",
      verifyBtn: "የውጤት ማረጋገጫ ገጽ ክፈት",
      algoTitle: "የአሸናፊ ቁጥር ማውጫ የሂሳብ ቀመር",
      formula: "አሸናፊ = parseInt(SHA256(ሚስጥር + ':' + የእጣ_መለያ + ':' + ደረጃ).slice(0, 8), 16) % 100",
    },
    winners: {
      title: "የቅርብ ጊዜ አሸናፊዎች",
      subtitle: "ሽልማታቸውን በቀጥታ የተቀበሉ እውነተኛ አሸናፊዎች ዝርዝር።",
      liveTicker: "የተረጋገጡ ክፍያዎች",
      verifiedPayout: "የተከፈለ",
      won: "አሸነፈ/ች",
      draw: "እጣ",
      ticket: "ቲኬት #",
    },
    howItWorks: {
      title: "ቀላል 3 ደረጃዎች",
      subtitle: "በቀላሉ ቲኬት ይቁረጡ፣ ይክፈሉ፣ በእጣው ቀን ያሸንፉ!",
      step1: "1. ቁጥርዎን ይምረጡ",
      step1Desc: "ከ00 እስከ 99 የሚወዱትን ወይም እድለኛ ቁጥርዎን ይምረጡ።",
      step2: "2. ክፍያ ይፈጽሙ",
      step2Desc: "በቴሌብር ወይም በሲቢኢ ብር የቲኬት ክፍያዎን ከፍለው የደረሰኝ ስክሪንሾት ያስገቡ።",
      step3: "3. የቀጥታ እጣ እና ሽልማት",
      step3Desc: "በእጣው ቀን አሸናፊው ይፋ ይሆናል፤ ሽልማትዎን ይቀበሉ እና የማረጋገጫውን ኮድ ያረጋግጡ።",
    },
    faq: {
      title: "ተደጋግመው የሚጠየቁ ጥያቄዎች",
      subtitle: "ስለ ደህንነት፣ ክፍያ፣ እና ሽልማት አሰጣጥ ማወቅ የሚፈልጉት ነገር ሁሉ።",
    },
    footer: {
      description: "ሪምና ዲጂታል ሎተሪ በክሪፕቶግራፊ ጥበቃ እና በግልጽ አሰራር ላይ የተመሰረተ ዘመናዊ የዲጂታል ሎተሪ አገልግሎት ነው።",
      rights: "መብቱ በህግ የተጠበቀ ነው። ሪምና ዲጂታል ሎተሪ።",
      support: "የደንበኞች አገልግሎት: +251 911 000 000 · support@rimnalottery.com",
      compliance: "100% በብሮውዘር ላይ ሊረጋገጥ የሚችል የታማኝነት ማረጋገጫ",
      transparency: "ግልጽ አሰራር",
      quickLinks: "ፈጣን አገናኞች",
      social: "ማህበራዊ ገጾቻችን",
    },
  },

  om: {
    appName: "Rimna Digital Lottery",
    tagline: "Kiriptoogiraafiin Mirkanaa'e Carraa Dijitaalaa fi Raafilii",
    nav: {
      draws: "Carraawwan",
      enter: "Carraa Bitadhaa",
      myEntries: "Tikkeettii Koo",
      results: "Bu'aa fi Mirkaneessa",
      admin: "Balbala Qindeessaa",
      howItWorks: "Akkamitti Hojjeta?",
      eventsDeals: "Qophii fi Gurgurtaa Addaa",
    },
    hero: {
      liveBadge: "CARRAA JIRU · BITTUUN BANAADHA",
      title: "Viilaa Tokko. Konkolaataa Elektiriki Tokko. Badhaasa Guddaa Sadarkaa 8.",
      subtitle: "Lakkoofsa 00 hanga 99 filadhaa, Telebirr ykn CBE Birr kaffalaa, bu'aa carrichaa ofumaan mirkaneeffadhaa. 100% iftoomina qaba.",
      enterCta: "Amma Hiri'adhaa",
      resultsCta: "Bu'aa Mirkaneessaa",
      exploreDraws: "Carraawwan Hunda Ilaalaa",
      closesIn: "Cufamuuf Yeroo Hafe",
      drawDay: "Guyyaa Carraa",
      trustBadge: "Pirootokoolii SHA-256 Mirkanaa'e",
    },
    promo: {
      badge: "Qophii fi Beeksisa Addaa",
      viewAllDeals: "Hunda Ilaalaa",
      exclusive: "Jaakpootii Ayyaanaa Addaa",
      limitedTime: "Yeroo Murtaa'eef Qofa",
      getDeal: "Carraa Kanaan Fayyadamaa",
    },
    drawsExplorer: {
      title: "Kattaa Carraawwan",
      subtitle: "Carraawwan banaa amma jiran, kan fuulduraa fi bu'aawwan darban ilaalaa.",
      tabCurrent: "Carraawwan Ammaa",
      tabUpcoming: "Kan Dhufan",
      tabPast: "Bu'aa Darbe",
      searchPlaceholder: "Badhaasaan, lakkoofsa carraatiin ykn mata-dureedhaan barbaadaa...",
      allCategories: "Gosa Badhaasaa Hunda",
      prizePool: "Waliigala Badhaasaa",
      ticketPrice: "Gatii Tikkeettii",
      entriesTotal: "Tikkeettii Mirkanaa'e",
      drawDate: "Guyyaa Carraa",
      winningNumbers: "Lakkoofsa Injifate",
      enterNow: "Carraa Kanaan Hiri'adhaa",
      viewDetails: "Bal'ina Ilaalaa",
      verifyResults: "Bu'aa Mirkaneessaa",
      startsIn: "Kan eegalu",
      completedOn: "Kan xumurame",
      noDrawsFound: "Carraan hin argamne.",
      filterBy: "Haalaan Adda Baasaa",
      statusOpen: "Banaa & Hojjechaa Jiru",
      statusUpcoming: "Dhiyootti Kan Eegalu",
      statusRevealed: "Mirkanaa'ee Kan Xumurame",
      seedHash: "Haashii Mirkaneessaa",
    },
    prizes: {
      title: "Gabatee Badhaasaa",
      subtitle: "Badhaasota Sadarkaa 1 hanga 10 qophaa'an.",
      rank1: "Sadarkaa 1ffaa",
      rank2: "Sadarkaa 2ffaa",
      rank3: "Sadarkaa 3ffaa",
      rankOther: "Sadarkaa",
      tierGrand: "Badhaasa Guddaa",
      tierMajor: "Badhaasota Olaanoo",
      tierStandard: "Badhaasa Qarshii",
    },
    quickPick: {
      title: "Lakkoofsa Filachuuf",
      subtitle: "Lakkoofsa digiti 2 (00-99) filadhaa ykn carraan filachiisaa.",
      selectedNumber: "Lakkoofsa Filatame",
      randomPick: "Tasa Filadhu",
      checkOdds: "Qophii Ta'uu Ilaali",
      instantEnter: "Lakkoofsa Kanaan Itti Fufi",
      hint: "Lakkoofsi hundi carraa qixxee qaba. Namoonni lama lakkoofsa walfakkaataa yoo filatan, namni dura kaffaltii mirkaneesse mo'ata.",
      availability: "Haala",
      available: "Banaa Dha",
      taken: "Qabameera (Dursi ni hojjeta)",
    },
    fairness: {
      title: "Iftoomina Kiriptoogiraafii",
      subtitle: "Sirni commit-reveal eenyullee bu'aa carrichaa akka hin jijjiirre mirkaneessa.",
      step1Title: "1. Duraan Cufuu",
      step1Desc: "Lakkoofsi dhoksaa 32-byte duraan qophaa'ee mallattoon SHA-256 ifatti maxxanfama.",
      step2Title: "2. Tikkeettii Walitti Qabuu",
      step2Desc: "Lakkoofsi fi kaffaltiin hirmaattotaa hundi sirnaan qabamee cufama.",
      step3Title: "3. Ifa Gochuu fi Mirkaneessuu",
      step3Desc: "Guyyaa carraa lakkoofsi dhoksaan ni ifooma; ofumaan bu'aa isaa mirkaneessuu dandeessu.",
      verifyBtn: "Fuula Mirkaneessaa Bani",
      algoTitle: "Foormulaa Herregaa",
      formula: "mo'ataa = parseInt(SHA256(dhoksaa + ':' + carraa_ID + ':' + sadarkaa).slice(0, 8), 16) % 100",
    },
    winners: {
      title: "Mo'attoota Dhiyoo",
      subtitle: "Mo'attoota badhaasa isaanii fudhatan mirkanaa'e.",
      liveTicker: "Kaffaltii Mirkanaa'e",
      verifiedPayout: "Kaffalameera",
      won: "mo'ate",
      draw: "Carraa",
      ticket: "Tikkeettii #",
    },
    howItWorks: {
      title: "Tarkaanfii 3 Salphaa",
      subtitle: "Salphaatti tikkeettii bitaa, kaffalaa, badhaafamaa!",
      step1: "1. Lakkoofsa Filadhaa",
      step1Desc: "Lakkoofsa carraa keessanii 00 hanga 99 keessaa filadhaa.",
      step2: "2. Kaffaltii Xumuraa",
      step2Desc: "Telebirr ykn CBE Birr kaffaltii erga raawwattanii booda nagahee galchaa.",
      step3: "3. Carraa fi Badhaasa",
      step3Desc: "Guyyaa carrichaa mo'ataan ni beeksifama; badhaasa keessan fudhadhaa.",
    },
    faq: {
      title: "Gaaffilee Yeroo Baay'ee Gaafataman",
      subtitle: "Nageenya, kaffaltii fi badhaasa fudhachuu ilaalchisee odeeffannoo hunda.",
    },
    footer: {
      description: "PrimeDraws sirna carraa dijitaalaa ammayyaa iftoomina kiriptoogiraafiin ijaarameedha.",
      rights: "Mirgi hundi seeraan eegamaadha. Hojii Carraa Dijitaalaa.",
      support: "Tajaajila Maamiltootaa: +251 911 000 000 · support@primedraws.com",
      compliance: "100% Iftoomina Mirkanaa'aa",
      transparency: "Iftoomina Banaa",
      quickLinks: "Liinkiiwwan Saffisaa",
      social: "Marsariitiiwwan Hawaasaa",
    },
  },
};
