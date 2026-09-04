# 🏛️ RIMNA INTERNATIONAL DIGITAL LOTTERY
## Comprehensive Master System Specification, Architecture & Living Documentation
> **Document Version**: 2.4.0 • **Last Updated**: September 2026 • **Status**: Living Active Master Document  
> *This master document tracks every feature, architectural component, design token, security standard, actor journey, and unfinished roadmap item across the Rimna Digital Lottery ecosystem.*

---

## 📑 TABLE OF CONTENTS
1. [Platform Vision & Identity](#1-platform-vision--identity)
2. [Actors, Roles & Personas](#2-actors-roles--personas)
3. [Design Culture, Aesthetics & UI Guidelines](#3-design-culture-aesthetics--ui-guidelines)
4. [Technology Stack & System Architecture](#4-technology-stack--system-architecture)
5. [Complete Feature Catalog & UX Flows](#5-complete-feature-catalog--ux-flows)
6. [Sanity CMS Content Architecture & Studio Tools](#6-sanity-cms-content-architecture--studio-tools)
7. [Security, Upload Restrictions & Sanitization](#7-security-upload-restrictions--sanitization)
8. [Bulk Actions & Storage Optimization Framework](#8-bulk-actions--storage-optimization-framework)
9. [Living Roadmap & Status Tracker (To Be Updated Per Milestone)](#9-living-roadmap--status-tracker)
10. [Local Development, Deployment & Maintenance Playbook](#10-local-development-deployment--maintenance-playbook)

---

## 1. PLATFORM VISION & IDENTITY

### 1.1 Mission
**Rimna International Digital Lottery (ሪምና ዲጂታል ሎተሪ)** is a high-stakes, transparent, and provably fair digital lottery platform engineered to bridge domestic Ethiopian lottery enthusiasts with the global Ethiopian diaspora. The platform enables players to customize their lottery tier, select pool sizes, choose lucky numbers, submit localized and international payment proofs, and participate in real-time stadium-grade draw events.

### 1.2 Core Pillars
1. **Unrivaled Stadium Aesthetics**: Immersive, luxurious visual experience with high-contrast imperial gold, rough physical ticket paper texture, stadium floodlights, and fluid micro-animations.
2. **Dual-Currency Inclusivity**: Native support for Ethiopian Birr (**ETB**) through domestic payment rails (Telebirr, CBE Birr, Awash, Dashen) and US Dollars (**USD**) for the Diaspora community via international wire and card payment.
3. **Provable Fairness & Transparency**: Real-time 10-tier winner reveals, live countdown synchronization, verifiable ticket receipts, and immutable draw records.
4. **Complete CMS Autonomy**: 100% of public-facing assets, hotlines, merchant accounts, pool sizes, and pricing tiers are controllable in real-time through the Sanity Headless CMS without requiring code redeployments.
5. **Storage-Optimized Infrastructure**: Automated binary sanitization, strict upload constraints, and bulk receipt management tools designed to reclaim cloud storage.

---

## 2. ACTORS, ROLES & PERSONAS

```
+-----------------------------------------------------------------------------------+
|                                 PLATFORM ACTORS                                    |
+-----------------------------------------------------------------------------------+
|  [Domestic Player]        [Diaspora Player]         [CMS Content Editor]           |
|  - Telebirr / CBE Birr    - USD Wire / Card         - Controls site banners/copy   |
|  - ETB Pricing Tiers      - USD Pricing Tiers       - Modifies Pool Sizes & Prices |
|  - Mobile First UX        - Multilingual Access     - Updates Payment Accounts     |
|                                                                                   |
|  [Admin Verification Officer]                     [Super Administrator]           |
|  - Reviews SMS / receipt proofs                   - Initiates & reveals draws     |
|  - Confirms / Rejects tickets                     - Bulk downloads proofs (ZIP)   |
|  - Issues digital ticket passes                   - Purges ended draw storage     |
+-----------------------------------------------------------------------------------+
```

### 2.1 Domestic Ethiopian Player
- **Profile**: Mobile-centric player located in Ethiopia, transacting in Ethiopian Birr (ETB).
- **Payment Rails**: Telebirr SuperApp, CBE Birr / Commercial Bank of Ethiopia direct account transfer, Awash Bank, Dashen Bank.
- **Primary Touchpoint**: Mobile web experience with quick SMS receipt screenshot uploads.

### 2.2 Diaspora International Player
- **Profile**: Ethiopian diaspora member living abroad (USA, Europe, Middle East, Canada), transacting in US Dollars (USD).
- **Payment Rails**: International wire remittance, SWIFT transfer, Visa / Mastercard checkout.
- **Primary Touchpoint**: Desktop and mobile web with high-ticket multi-pool selections.

### 2.3 CMS Content Editor
- **Profile**: Marketing and operations officer managing platform copy and visual assets.
- **Permissions**: Access to Sanity Studio (`/studio`) to edit panoramic banners, brand logos, 24/7 hotline numbers, official Telegram channels, pricing tiers, and promotional partner carousels.

### 2.4 Admin Verification Officer
- **Profile**: Compliance and financial officer responsible for approving incoming ticket purchases.
- **Permissions**: Access to `/studio` and `/admin/dashboard` to inspect receipt screenshots, verify transaction IDs, and transition ticket status from `Pending` ➔ `Confirmed` or `Rejected`.

### 2.5 Super Administrator
- **Profile**: Platform lead with complete operational governance.
- **Permissions**: Controls draw lifecycle (`Open` ➔ `Closed` ➔ `Revealed`), triggers live 10-tier winner selection, executes bulk screenshot downloads in ZIP archives, and runs automated storage purge scripts.

---

## 3. DESIGN CULTURE, AESTHETICS & UI GUIDELINES

Rimna's design culture is built upon **"Imperial Ethiopian Luxury meets High-Stakes Stadium Excitement."**

```
+-------------------------------------------------------------------------------+
|                             COLOR PALETTE TOKENS                              |
+-------------------------------------------------------------------------------+
|  Primary Gold        |  #FDE047 (Vibrant Gold)  |  #D4AF37 (Metallic Gold)   |
|  Deep Background     |  #0B0F17 (Obsidian Void) |  #111827 (Night Sky Navy)  |
|  Card Surfaces       |  #1E293B (Slate Surface) |  rgba(20,26,36,0.7) Glass  |
|  Ticket Paper        |  #FAF8F2 (Rough Cream)   |  #FFFDF5 (Ivory Paper)     |
|  Accents             |  #DC2626 (Ruby Ribbon)   |  #10B981 (Emerald Green)   |
+-------------------------------------------------------------------------------+
```

### 3.1 Color Palette & Visual Tokens
- **Imperial Gold (`#FDE047`, `#D4AF37`, `#F59E0B`)**: Represents grand prize jackpots, luxury borders, interactive hover states, and primary CTA buttons.
- **Dark Night Sky (`#0B0F17`, `#111827`, `#1F2937`)**: Provides deep contrast for hero stadiums, neon spotlights, and high-stakes casino ambiance.
- **Rough Cream Physical Paper (`#FAF8F2`, `#FFFDF5`)**: The authentic paper lottery ticket background featuring physical stippled dot patterns (`radial-gradient(#D6D0C4 0.75px)`) and half-moon ticket notches.
- **Ruby Ribbon Badge (`#DC2626`)**: Used for urgent countdown ribbons, live draw status tags, and high-priority alerts.
- **Emerald Green (`#10B981`, `#34D399`)**: Signifies confirmed payments, verified badges, and active hotline channels.

### 3.2 Typography & Iconography
- **Headings & Displays**: `Outfit` / `Cinzel` inspired luxury sans-serif with bold letter-spacing.
- **Body & UI**: `Inter` for clarity, contrast, and multilingual readability (supporting Amharic and Afaan Oromoo scripts).
- **Lucky Numbers & Serial Keys**: `JetBrains Mono` / Monospace for authentic stamped ticket aesthetics.
- **Iconography**: `lucide-react` with custom styled vector emblems.

### 3.3 Authentic Rough Paper Ticket Styling (`.rough-paper-ticket`)
Every issued or configured ticket renders with:
- Dual-layer radial stippling imitating genuine physical lottery security paper.
- Circular punched half-moon notches (`.ticket-notch-top`, `.ticket-notch-bottom`) on the perforations.
- Barcode and serial number stamped with gold foil accents.

---

## 4. TECHNOLOGY STACK & SYSTEM ARCHITECTURE

```
+------------------------------------------------------------------------------------+
|                                TECH STACK OVERVIEW                                 |
+------------------------------------------------------------------------------------+
|  Frontend Framework     |  Next.js 14.2.5 (App Router, Server & Client Components) |
|  Language               |  TypeScript 5.x                                          |
|  Styling Architecture   |  Vanilla CSS Design Tokens + Scoped CSS Modules          |
|  3D Graphics Engine     |  Three.js 0.185 (Interactive 3D Sphere Jackpot Visual)   |
|  Content Management     |  Sanity Studio v3.99 + Sanity Content Lake (GROQ API)     |
|  Archive Engine         |  JSZip (Client & Server bulk zip packaging)              |
|  Internationalization   |  Custom React Context (English, Amharic, Afaan Oromoo)   |
|  Security Layer         |  Binary magic-byte inspection, file sanitizer, RBAC      |
+------------------------------------------------------------------------------------+
```

### 4.1 Frontend Architecture (`/frontend`)
- **`app/page.tsx`**: Dynamic panoramic homepage integrating the 3D Cinematic Stadium Hero, Customizable Lottery Configurator, Live Countdown, Partner Logo Farm, and Winner Testimonials.
- **`app/how-it-works/page.tsx`**: Visual 4-step tutorial detailing custom configuration, payment submission, ticket generation, and draw reveal.
- **`app/results/page.tsx`**: Historical archive displaying past draw results, winning lucky numbers, and 10 prize tiers.
- **`app/entries/page.tsx`**: Player personal ticket dashboard showing pending, confirmed, and past tickets.
- **`app/admin/dashboard/page.tsx`**: Administrator portal with live ticket verification, draw controls, and bulk screenshot management.
- **`app/studio/[[...tool]]/page.tsx`**: Embedded Sanity Studio with custom visual tools.

### 4.2 CMS Client Separation
- **`sanityClient`** (`lib/sanity/client.ts`): Public read-only client configured with `useCdn: false` for instant real-time data fetching.
- **`writeClient`**: Secured backend client authenticated via `SANITY_API_TOKEN` for processing file uploads, ticket document creations, and asset purges.

---

## 5. COMPLETE FEATURE CATALOG & UX FLOWS

### 5.1 Responsive Split Navbar (`Nav.tsx`)
- **Desktop (Grid 1fr auto 1fr)**:
  - **Left Section**: `Draws` (`/`), `How It Works` (`/how-it-works`), `Results` (`/results`).
  - **Center**: Official Brand Logo (`/`).
  - **Right Section**: `My Tickets` (`/entries`), `Why Rimna` (`/about`), and `Contact Us` gold action button.
- **Mobile (< 768px)**:
  - Brand Logo left-aligned.
  - Hamburger breadcrumb button right-aligned opening a smooth slide-down menu drawer with all 5 navigation links, language selector, and contact modal trigger.
- **Utility Header Ribbon**:
  - Live Telegram channel link (`@RimnaLotteryOfficial`).
  - 24/7 hotline click-to-call link.
  - Multilingual Language Switcher (EN / AM / OM).
  - User profile / Login & Registration trigger.

### 5.2 Cinematic Stadium Hero (`CinematicStadiumHero.tsx`)
- Immersive high-definition stadium backdrop dynamically fed from Sanity CMS `heroBannerImageUrl`.
- Realistic 3D rotating lottery ball sphere rendered with **Three.js**.
- High-contrast live countdown timer ticking down to the next scheduled draw event.
- Live jackpot ticker displaying current estimated prize pool.

### 5.3 Interactive Ticket Configurator (`InteractiveTicketConfigurator.tsx`)
Allows players to customize their lottery ticket before entering the purchase modal:
1. **Currency Toggle**: Switch between **ETB (Ethiopian Birr)** and **USD ($)**.
2. **Price Tier Selection**: Dynamic price pills populated directly from Sanity CMS `siteSettings.etbPrices` and `siteSettings.usdPrices`.
3. **Pool Size Selection**: Dynamic pool capacity buttons populated from `siteSettings.poolSizes` (e.g. 1,000 / 2,000 / 3,000 / 5,000 participants).
4. **Calculated Estimated Jackpot**: Real-time reactive calculation (`Price × Pool Size × 80% Payout`).
5. **Interactive Number Picker**: Grid of lucky numbers strictly scoped to the selected pool size.
6. **"Buy Custom Ticket" Button**: Seamlessly launches the Buy Ticket Modal with all configured selections pre-populated.

### 5.4 Unified Buy Ticket Modal (`BuyTicketModal.tsx`)
A structured 4-step wizard with persistent state:
- **Step 1: Contact Information**: Auto-fills player name and phone if authenticated; provides promo code entry.
- **Step 2: Lucky Number Selection**: Number grid dynamically sized to the pre-selected pool size.
- **Step 3: Payment Instructions**: Displays dynamic Telebirr Merchant Code, CBE Account Details, or Diaspora Wire instructions.
- **Step 4: Proof Upload & Verification**: Integrates the `PaymentProofUploader` with real-time feedback, binary validation, and instant ticket generation upon submission.

### 5.5 Promotional Ads & Partner Logo Farm
- **`AdvertisementCarousel.tsx`**: Dynamic promotional banner carousel for featured vehicles, luxury villas, and sponsor advertisements.
- **`PartnerLogoFarm.tsx`**: Standardized, uniform logo farm displaying payment partners (Telebirr, CBE, Awash, Dashen, Visa, Mastercard) with equal height and grayscale-to-gold hover animations.

---

## 6. SANITY CMS CONTENT ARCHITECTURE & STUDIO TOOLS

```
+--------------------------------------------------------------------------------+
|                         SANITY SCHEMA ARCHITECTURE                             |
+--------------------------------------------------------------------------------+
|  [siteSettings]       -> 10 Official Brand Fields, Dynamic Pools & Prices     |
|  [playerEntry]        -> Submitted Receipts, Proof Screenshots, Approval State |
|  [draw]               -> Active Draw Countdown, Target Jackpot, Status         |
|  [drawResult]         -> 10 Winner Tiers, Prize Amounts, Reveal Date           |
|  [advertisement]      -> Promotional Banners & Sponsor Cards                   |
|  [testimonial]        -> Winner Stories & Verified Badges                      |
|  [contactMessage]     -> Player Support & Inquiry Inbox                        |
+--------------------------------------------------------------------------------+
```

### 6.1 `siteSettings` (Singleton Document)
1. `siteName`: Platform brand title.
2. `logoImage`: Official high-res logo/emblem.
3. `heroBannerImage`: Panoramic stadium banner.
4. `contactPhone`: 24/7 hotline telephone number.
5. `telegramHandle`: Official Telegram handle.
6. `telegramUrl`: Direct Telegram channel URL.
7. `supportEmail`: Customer support email address.
8. `telebirrMerchantCode`: Official Telebirr shortcode.
9. `cbeAccountNumber`: Commercial Bank of Ethiopia account number.
10. `cbeAccountName`: CBE official account holder name.
11. `diasporaWireInstructions`: SWIFT/IBAN wiring instructions for USD transactions.
12. `etbPrices`: Dynamic array of ETB price tiers with enable/disable switches.
13. `usdPrices`: Dynamic array of USD price tiers with enable/disable switches.
14. `poolSizes`: Dynamic array of participant pool sizes (1K, 2K, 3K, 5K, etc.).

### 6.2 `playerEntry` (Receipts & Proofs)
- Stores player full name, phone number, draw ID, lucky number, pool size, price paid, currency, payment method, submission timestamp, and admin verification status (`pending`, `confirmed`, `rejected`).
- Structured in Sanity Studio with categorized filter lists:
  - 📋 All Submitted Receipts
  - 🟡 Pending Verification
  - 🟢 Confirmed & Approved
  - 🔴 Rejected Proofs

### 6.3 Studio Tab Order & Custom Tools
Sanity Studio header navigation tabs are strictly ordered:
1. **`Structure`** (`/studio/structure`): Complete CMS management hierarchy including ticket receipts, active draws, results, site settings, ads, testimonials, and backup manager.
2. **`Storage & Screenshots`** (`/studio/screenshot-manager`): Dedicated dashboard for disk storage metrics, proof filtering, 1-click batch ZIP downloads, and storage-saving asset purges.
3. **`Vision`** (`/studio/vision`): GROQ testing console.

### 6.4 Full CMS Backup & Restore Manager (`BackupView.tsx`)
Embedded directly inside the Sanity Structure navigation under **"💾 CMS Complete Backup & Export"**:
1. **Dataset Content Breakdown**: Real-time live counter of total documents, player receipts, active draws, results, advertisements, and testimonials.
2. **Export Dataset (JSON / ZIP)**:
   - **Complete JSON Backup**: 1-Click download of the entire CMS dataset (`rimna_cms_backup_[timestamp].json`) containing all platform settings, lottery pools, pricing models, receipts, and winner history.
   - **Full ZIP Archive Bundle**: Bundles the complete JSON dataset with media references and backup README into a `.zip` archive for cold storage.
   - **Backup Timestamp Tracker**: Automatically records the date and time of the last backup.
3. **Interactive 1-Click Restoration Engine**:
   - **File Upload & Validation**: Upload any previously exported `rimna_cms_backup_*.json` file directly in the Sanity Studio UI.
   - **Automated Document Parsing**: Parses documents, displays the document count, and validates schema integrity.
   - **Live Restoration with Real-time Progress**: Sequentially executes `client.createOrReplace(doc)` for each document, updating live progress bar and status log.
4. **CLI / Command-Line Restoration Alternative**:
   - Run `npx sanity dataset import [backup_file].ndjson [dataset_name] --replace` from the command line.

---

## 7. SECURITY, UPLOAD RESTRICTIONS & SANITIZATION

```
+-------------------------------------------------------------------------------+
|                       MULTI-TIER SECURITY PIPELINE                            |
+-------------------------------------------------------------------------------+
|  1. Client-Side Check  | 5MB Max Size • Strict MIME type (JPEG, PNG, WEBP)   |
|  2. Server-Side Check  | 5MB Size Validation • HTTP 400 Bad Request Rejection |
|  3. Binary Inspection  | Magic Bytes Header Verification (FF D8 FF / 89 50)  |
|  4. Filename Cleaning  | Traversal Stripping • Unique Timestamped Slug        |
|  5. Token Separation   | Public Read CDN vs Private Write Token Isolated      |
+-------------------------------------------------------------------------------+
```

### 7.1 Binary Magic Bytes Validation
To prevent disguised executables or malicious files from being uploaded as images, [`app/api/entries/submit/route.ts`](file:///Users/zemichaeltefera/Documents/GitHub/lottery-game/frontend/app/api/entries/submit/route.ts) inspects the raw buffer magic bytes:
- **JPEG**: Header starts with `0xFF, 0xD8, 0xFF`.
- **PNG**: Header starts with `0x89, 0x50, 0x4E, 0x47`.
- **WEBP**: Header starts with `RIFF` and contains `WEBP` identifier.

### 7.2 Filename Sanitization
All filenames are scrubbed of path traversal characters (`..`, `/`, `\`) and non-alphanumeric symbols, prepend-stamped with unix timestamps:
`proof_[timestamp]_[clean_slug].[ext]`

---

## 8. BULK ACTIONS & STORAGE OPTIMIZATION FRAMEWORK

### 8.1 The Storage Problem
When thousands of players submit high-resolution payment screenshots, Sanity asset storage and server bandwidth can rapidly fill up.

### 8.2 The Solution: Automated Bulk Management
1. **REST API Endpoint (`/api/admin/screenshots`)**:
   - **`GET`**: Returns filtered receipts along with aggregate storage statistics (`totalStorageBytes`, breakdown by draw and pool).
   - **`DELETE`**: Deletes `playerEntry` documents **and unlinks/permanently destroys underlying Sanity image assets** (`writeClient.delete(assetId)`).
2. **Bulk ZIP Download**:
   - Packages hundreds of screenshots into a single organized ZIP archive (`rimna_screenshots_[drawId]_[date].zip`) via `jszip` before deletion.
3. **1-Click Revealed Draw Purge**:
   - Enables administrators to purge all screenshots from finished draws in one click once winners are announced and payouts are disbursed.

---

## 9. LIVING ROADMAP & STATUS TRACKER

> **Maintenance Note**: This section must be updated as items transition between *In Progress* (🔄) and *Completed* (✅).

```
+-------------------------------------------------------------------------------+
|                         STATUS MATRIX & ROADMAP                               |
+-------------------------------------------------------------------------------+
|  Feature Area                       | Status       | Target Milestone         |
+-------------------------------------+--------------+--------------------------+
|  Uniform Logo Farm Sizing           | ✅ Completed  | Release v2.1.0           |
|  Configurator-to-Modal State Sync   | ✅ Completed  | Release v2.1.0           |
|  Sanity Dynamic Site Settings (10)  | ✅ Completed  | Release v2.2.0           |
|  Dynamic Pool & Pricing Arrays      | ✅ Completed  | Release v2.2.0           |
|  Split Desktop Navbar Layout        | ✅ Completed  | Release v2.3.0           |
|  How It Works Link & Page           | ✅ Completed  | Release v2.3.0           |
|  5MB Upload Limit & Sanitization    | ✅ Completed  | Release v2.4.0           |
|  Magic Bytes Header Inspection      | ✅ Completed  | Release v2.4.0           |
|  CMS Bulk Screenshot Manager Tool   | ✅ Completed  | Release v2.4.0           |
|  Bulk ZIP Screenshot Downloader     | ✅ Completed  | Release v2.4.0           |
|  Storage-Saving Asset Purge API     | ✅ Completed  | Release v2.4.0           |
|  CMS Tab Order (Structure, Storage) | ✅ Completed  | Release v2.4.1           |
|  CMS Full Backup & Export Tool      | ✅ Completed  | Release v2.4.1           |
|  SMS Gateway Automated OCR Parsing  | ⏳ Planned    | Release v2.5.0           |
|  Diaspora Stripe / Card Gateway     | ⏳ Planned    | Release v2.5.0           |
|  Automated Telegram Bot Notifier    | ⏳ Planned    | Release v2.6.0           |
|  Provably Fair On-Chain VRF Draw    | ⏳ Planned    | Release v3.0.0           |
+-------------------------------------------------------------------------------+
```

### 9.1 Completed Milestones (✅)
- [x] **Uniform Partner Logo Farm**: Standardized logos with equal dimensions and luxury gold hover.
- [x] **Configurator Modal Persistence**: Pool sizes, ticket price, lucky number quantity, and user data persist across all steps.
- [x] **Complete CMS Dynamic Bindings**: Site title, hotline, Telegram, support email, Telebirr merchant code, CBE account details, and diaspora instructions dynamically loaded.
- [x] **Split Desktop Navbar**: Left links (`Draws`, `How It Works`, `Results`), Center Logo, Right links (`My Tickets`, `Why Rimna`, `Contact Us`).
- [x] **Responsive Mobile Breadcrumb**: Left-aligned logo, right-aligned hamburger button with slide-down drawer.
- [x] **Image Sanitization**: 5MB client/server limits, JPEG/PNG/WEBP whitelist, binary magic byte validation.
- [x] **Bulk Screenshot Management**: Sanity Studio tool & REST API for bulk filtering, ZIP downloads, and storage-saving document/asset purges.
- [x] **CMS Studio Tab Order**: Strictly ordered as `Structure` ➔ `Storage & Screenshots` ➔ `Vision` (with "Content Sync" removed).
- [x] **CMS Complete Backup & Export Tool**: Added `💾 CMS Complete Backup & Export` inside Structure with 1-click JSON and ZIP dataset exports.

### 9.2 In-Progress & Next Up (🔄)
- [ ] **Automated Telebirr SMS Parser / OCR**: Exploring lightweight client/server OCR to automatically extract Telebirr Transaction ID and amount from screenshots.
- [ ] **Diaspora Payment Gateway (Stripe / PayPal Integration)**: Adding automated card checkout for diaspora users alongside wire instructions.

### 9.3 Future Roadmap (⏳)
- [ ] **Telegram Bot Notifications**: Automated bot sending ticket confirmation alerts to players upon admin verification.
- [ ] **Provably Fair Smart Contract / VRF Draw System**: Verifiable random function (Chainlink VRF or commit-reveal hash) for decentralized live draws.

---

## 10. LOCAL DEVELOPMENT, DEPLOYMENT & MAINTENANCE PLAYBOOK

### 10.1 Environment Variables Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=ocm4sz73
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=sk...your_write_token...
```

### 10.2 Development Commands
```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install

# Start local Next.js development server
npm run dev

# Run TypeScript compilation check
npx tsc --noEmit

### 10.3 Vercel Production Deployment & Sanity CORS Configuration
When hosting on Vercel, Sanity Studio operates as an embedded SPA in the user's browser connecting to `https://[project-id].api.sanity.io`.

1. **Add Vercel Domain to Sanity CORS Allowed Origins**:
   - Navigate to [https://sanity.io/manage](https://sanity.io/manage) ➔ Select Project **`ocm4sz73`** ➔ **API** ➔ **CORS Origins**.
   - Click **Add CORS Origin**.
   - Origin: `https://*.vercel.app` (or your custom domain like `https://your-domain.com`).
   - Allow credentials: **Check "Allow credentials" (True)**.
   - Save.

2. **Configure Environment Variables in Vercel Dashboard**:
   - Go to your Vercel Project ➔ **Settings** ➔ **Environment Variables**.
   - Add:
     - `NEXT_PUBLIC_SANITY_PROJECT_ID` = `ocm4sz73`
     - `NEXT_PUBLIC_SANITY_DATASET` = `production`
     - `SANITY_API_TOKEN` = `your_sanity_write_token`

---
*End of Grand Master Documentation — Keep this file up to date with every subsequent codebase modification.*

