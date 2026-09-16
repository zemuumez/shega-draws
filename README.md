# Rimna Digital Lottery

Next.js website on Vercel, with Sanity CMS for draws, guest ticket receipts, payment screenshots, content and employee review. No separate Go server, PostgreSQL, Redis, S3 or player accounts are required.

## Run locally

1. Copy `.env.example` to `frontend/.env.local` and enter your Sanity project, dataset and server-only write token.
2. Run `make frontend-install`, then `make frontend-run`.
3. Open `http://localhost:3000`. Employees sign into Sanity at `/studio`.

## Publish ticket sales in CMS

1. Under **Site Settings**, enable each allowed price and pool capacity. For a 25K participant pool, enter **25000**.
2. Enter real Telebirr/CBE payment details, or international transfer instructions for USD purchases.
3. Publish **Site Settings**. An enabled price and enabled pool authorize that combination immediately. For example, enabled USD 25 + enabled 25000 means the USD 25 / 25K ticket is on sale. Draw documents and deadlines are optional broadcast information and do not gate purchases.
4. Buyers choose an enabled price and pool option, enter their name and phone, select a number from **1 through the pool capacity**, and submit a payment reference plus a PNG/JPEG/WebP screenshot (maximum **3 MB**).
5. Receipts are saved in Sanity with status **Pending**. The screen confirms receipt submission, not payment verification. Customers should save their submission reference.

Missing settings, disabled tiers, unconfigured payment methods, unavailable numbers and CMS failures block purchases. The modal refreshes availability every 15 seconds; the server checks again on submission. A deterministic ID scoped to currency, price and pool capacity, plus an atomic transaction, prevents two submissions for the same number in that pool. Retries of the same request return the original receipt.

All submitted numbers stay reserved, including rejected receipts, until the employee deletes that receipt in Studio. Deleting releases the number, so export records first. Historical Sanity receipts are included in exports and availability when their currency, price and pool capacity match, regardless of their old draw reference. Switching a tier off and back on does not reset its taken numbers. Existing PostgreSQL records are not copied automatically.

## Employee review and exports

Open **Studio → Players & Exports** and sign in with a Sanity account that can read the dataset.

- Filter by ticket pool reference (shown in the Draw filter), pool capacity, price, currency or review status.
- **Excel — filtered / selected** exports a real `.xlsx` workbook.
- **Excel + screenshots ZIP** contains `players.xlsx` and a `screenshots/` folder. Each player's row names the matching screenshot.
- Names, phones, ticket numbers and payment references are exported as text to preserve leading zeroes and prevent formula execution.
- Missing/failed screenshots are identified in the workbook, ZIP README and on screen. They are never silently counted as successful downloads.
- Review and publish each status change in **Submitted Ticket Receipts**. Pending does not mean payment confirmed.

Exports run in the staff browser through the authenticated Studio client. There is no public players-list/export API. For large volumes, export one draw or smaller selections to keep browser memory usage reasonable.

## Vercel setup

Keep the Vercel project Root Directory as `frontend`. Add the four variables from `.env.example` to the desired environments, then redeploy. The `SANITY_API_TOKEN` needs write permission and stays server-side. Add your Vercel origin to Sanity's CORS settings with credentials for Studio login. Guests need no account.

Remove obsolete backend URLs/JWT/database/Redis/S3 variables from Vercel when no longer used. Any existing Render resources are independent; this code change does not delete them or their stored records.

## Receipt privacy

New receipt IDs use the `private.entry.` path, which Sanity restricts to authenticated readers even in public datasets ([Sanity ID access rules](https://www.sanity.io/docs/content-lake/ids)). The public availability endpoint returns only ticket numbers and draw settings. Previously created root-ID records retain their existing visibility; review or migrate them separately.

Standard Sanity Content Lake asset URLs are publicly accessible to anyone with the URL, including payment screenshots ([Sanity asset behavior](https://www.sanity.io/docs/developer-guides/multi-tenancy-implementation)). Do not treat these screenshots as private file storage. If authenticated access to image bytes is required, use Sanity private Media Library assets and signed URLs before accepting sensitive receipts.

## Checks

`make test` runs guest submission, availability, concurrency and export tests. `cd frontend && npx tsc --noEmit --incremental false` checks TypeScript. `make frontend-build` builds the website.
