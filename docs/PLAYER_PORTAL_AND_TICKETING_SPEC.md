# Rimna — Revised Player Portal and Ticketing Specification

Date: 28 September 2026  
Status: design specification; not a claim that these features are implemented or production-ready.

Track implementation and release evidence in the [Master Development and Release Checklist](DEVELOPMENT_CHECKLIST.md).

This document records the owner's revised direction. Written requirements take precedence over the reference screenshots. The screenshots guide layout and navigation; their demo balances, withdrawal/referral features, deduction percentages, automatic draw selection and sold-out closing rules are not automatically adopted.

## 1. Confirmed product direction

- Players log in, deposit funds and use their available balance to buy lottery tickets.
- One player account can have separate ETB and USD balances and switch between them.
- Each lottery has a currency, ticket price, number range/capacity and a fixed closing date.
- Players choose how many tickets to buy. Lucky numbers are assigned randomly from available numbers, or players can choose available numbers themselves.
- Each issued ticket displays both a tracking identifier and its lucky number.
- The owner conducts winner selection on a live social-media stream. Random assignment of a ticket's number is distinct from selection of winning numbers.
- The portal includes lotteries, tickets, results, winnings information, deposits and transaction history.
- Self-service withdrawals are excluded from this phase.
- Winners receive their prizes outside the website. Prize awards and recorded settlement status remain visible in the portal; awards do not automatically increase the spendable wallet balance.
- The owner intends to sell every number before the fixed closing deadline. This is an operating expectation, not an automatic extension of sales or permission to mark unpaid numbers as sold.
- If the round does not sell out, the draw still proceeds using only sold, eligible tickets. Unsold numbers cannot win.
- A customer can win several prizes through different tickets. The ten prize positions do not require ten different customers.
- Lottery details disclose deductions and the ten prize positions, current prize fund and maximum possible prize fund.

There remains a capacity for each lottery. Players no longer select a generic pool size before choosing a lottery; they select an administrator-created lottery with published rules.

## 2. Portal layout

Use the reference's desktop sidebar, clear page title, balance summary, lottery cards and detailed purchase modal. On mobile, use compact navigation and stacked cards; transaction tables must remain usable without depending on desktop-width columns.

| Page | Proposed behavior |
| --- | --- |
| Overview | Selected currency balance, deposits, tickets, recent activity and upcoming draws. Show awarded winnings separately from spendable money. |
| All lotteries | Currency filters, open/closed status, price, sold/capacity, current prize fund, maximum at capacity, closing time and purchase action. |
| My tickets | Tracking ID, lucky number, lottery/round, currency, price, purchase date and result. Support search and pagination. |
| Results / My winnings | Published winning numbers and prize positions, the player's winning tickets, verification/payment status and stream or recording link where provided. |
| Deposit money | Currency-specific amount entry, available approved payment methods, limits/fees and pending/success/failed status. |
| Transactions | Deposits, purchases, refunds and authorized adjustments with currency, amount, date, reference and status. |
| Account | Profile, security, language and sign-out controls. |

Remove withdrawal navigation. Referral rewards and automatic payouts are outside this specification. Do not show demo funding actions in production or technology labels in the customer navigation.

## 3. Separate currency balances

ETB and USD are separate accounts within one login. Switching currency changes the displayed balance and relevant records; it does not exchange money. No automatic conversion, cross-currency spending or customer-to-customer transfers are proposed.

An ETB lottery debits ETB only; a USD lottery debits USD only. Never sum the two balances into one monetary total without an explicitly defined exchange feature. Store money in integer minor units with its currency.

Accept a customer-entered deposit amount within configured minimums, maximums and supported precision, rather than literally unlimited amounts. Display applicable fees before confirmation. Do not enable a currency's real deposits until an approved provider and settlement flow are available for it. USD support in the portal does not itself establish international payment availability.

Credit a deposit only after server-side verification of the provider transaction, including its account/order association, amount, currency and final status. Pending or uncertain payments are not spendable. Record each verified deposit once, even when notifications are repeated.

## 4. Ticket identity and purchasing

Each ticket has:

- A globally unique tracking identifier used for receipts, support and auditing.
- A lucky number unique within its lottery round, selected from that round's published range.
- The owner, round ID, currency, price, order, purchase time and status.

For example, tracking ID `RIM-7F2C91A8` could identify lucky number `018427` in one particular round. The same lucky number can appear in another round without representing the same ticket.

The purchase modal offers **Choose for me** and **Choose my numbers**. Automatic assignment must use secure randomness and avoid duplicates within an order or between orders. For manual selection, show unavailable numbers disabled. Provide search and paginated or virtualized number ranges rather than rendering tens of thousands of buttons at once.

Availability is advisory until the backend confirms purchase. If another buyer acquires a selected number first, explain the conflict and let the player choose again; do not silently replace a deliberately selected number.

Proposed initial purchase behavior is all-or-nothing: validate the requested quantity, current price, selected currency, available balance, draw status, deadline and available numbers. Debit the wallet, issue all tickets, update inventory and record the financial entries in one database transaction. If any part fails, issue no tickets and deduct no balance. A retry with the same purchase identifier returns the original outcome; reusing that identifier with different purchase details must be rejected.

Use a balanced, append-only financial ledger, with corrections recorded as reversals. Enforce unique provider credits, order identifiers and per-round lucky-number allocation in PostgreSQL. All future API and worker hosts share the authoritative database. Refund, dispute and administrator-adjustment paths must obey the same accounting rules.

## 5. Fixed closing dates and the live draw

Display the precise closing date, time and timezone. Enforce closure in the purchase transaction using the backend's authoritative clock and locked draw state, so client clocks or a delayed background task cannot extend sales. Sold-out lotteries stop accepting purchases early but retain their announced draw schedule unless their published rules explicitly provide otherwise.

At closing, freeze the eligible paid-ticket register, final prize calculation and applicable rules. Produce a timestamped audit snapshot with a checksum for the draw operator. Staff should not be able to silently add tickets or change prices, capacity, deduction rates or prize percentages after sales begin.

Winning numbers are recorded from the live draw; the website does not independently invent a different set of winners. Proposed publication controls include a draft result, verification against the frozen register, a second authorized staff review, the stream/recording reference and an audit trail for corrections. These controls support review but do not by themselves prove that a physical or streamed draw is fair.

The owner expects every number to be sold by closing. Verify actual eligible paid sales against capacity; do not infer a sellout from that expectation. The fixed deadline still applies. The application must not silently extend sales, fabricate purchases or assign unpaid numbers to fill the register.

The client confirmed that a round which does not sell out still proceeds at its scheduled draw using only sold, eligible tickets. Freeze this eligible-number list for the live draw. Unsold numbers must not enter the draw; if the physical process can produce them, a published procedure must reject them and redraw without awarding a prize to an unsold number. Calculate the final prize fund from actual eligible sales after the disclosed deductions, not from the maximum capacity projection.

The allocation of unfilled prize positions when fewer than ten eligible tickets exist remains unresolved; do not invent extra winners, duplicate a winning ticket or silently retain/redistribute those prize amounts. When asked about this case, the client reiterated that the owner will ensure most tickets sell; that confirms the operating expectation but does not select an allocation rule. Show staff an explicit warning when sales are below ten eligible tickets, including at the closing review. A zero-sales round has no eligible winners and must be recorded as such. These edge-case rules must be defined before opening sales.

One customer may win several prize positions using different tickets. Treat the prize positions as ten distinct winning tickets, not necessarily ten distinct people, and prevent the same ticket from occupying multiple prize positions in the same round. Validate each published lucky number against the frozen eligible register.

## 6. Prize information and money owed

Clearly distinguish:

1. Current estimated net prize fund, based on eligible ticket sales and disclosed deductions.
2. Maximum possible net prize fund if all tickets sell, explicitly conditional rather than guaranteed.
3. Final prize fund and allocations, frozen after closing and reconciliation.

Wallet deposits are customer balances, not lottery ticket sales. A deposit contributes to a lottery's collections only when used for a successful ticket purchase. The platform must be able to reconcile unspent customer balances, purchase proceeds, refunds and prize obligations separately.

The ten prize percentages must total 100% of the defined distributable prize fund. Specify rounding and the handling of any remainder. The reference's example tax and fee percentages remain placeholders until the business confirms the actual deductions and their basis.

The client confirmed that prizes are paid outside the website. Display awards separately from spendable wallet balances. Do not automatically credit prize money as reusable deposit funds or expose a withdrawal action.

Proposed staff workflow: an award starts as **Pending external payment**. After paying the winner externally, authorized staff record the payment amount, currency, date and reference, then mark it **Paid externally**. Retain private supporting evidence and an audit trail identifying the staff member. The player can see their own award and settlement status; private bank details and evidence are not public result data. The status records the operator's payment confirmation, not an independently verified provider payout. Guard each award against duplicate settlement records and preserve corrections as audited changes. Where one external payment covers several awards, explicitly allocate it to those awards to avoid counting the same payment several times.

The refund procedure for unused deposits and cancelled lotteries remains unresolved. Omitting self-service withdrawals does not automatically mean deposits or cancelled purchases are non-refundable. Agree and disclose the procedure before accepting deposits.

## 7. Architecture and delivery impact

Continue with the Go modular backend and PostgreSQL for operational records, Better Auth for authentication, and Sanity for website content. Use separate modules for accounts, ledger, deposits, ticket inventory, purchases, draw results and administration. Background workers handle verification/reconciliation and notifications; the purchase's balance deduction and ticket allocation remain one atomic database operation.

Automatic assignment avoids the requirement for every buyer to browse a live number grid. Optional manual selection still requires availability checks and safe conflict handling. Keep the waiting room, rate limits, indexed/paginated history, monitored database connections and the previously planned backup/recovery controls. Neither wallets nor automatic assignment establish a new concurrency guarantee without load testing.

The earlier 8–10 week schedule covered direct Chapa purchases and excluded a customer wallet and a new draw-selection engine. This revision adds a two-currency ledger, deposit flows, bulk ticket purchasing, optional number selection and live-result administration. The original schedule must be re-estimated once the remaining rules and provider scope are agreed; it must not be represented as a commitment for this expanded scope.

## 8. Decisions needed before implementation

1. **Fewer than ten tickets:** how should the shares for unfilled prize positions be handled when fewer than ten eligible tickets exist? The draw still proceeds using sold tickets; the prize-allocation exception needs a published rule.
2. **Refunds:** how are unused deposits and cancelled purchases refunded, and who processes and records them?
3. **USD launch:** which approved provider funds USD accounts, or does the initial live release enable ETB only while USD remains unavailable?

External prize payment, multiple wins through different tickets and proceeding with sold tickets at the fixed deadline are confirmed. The remaining decisions above are unresolved. No screenshot placeholder supplies an answer on the client's behalf.

The proposed administration portal and frontend/backend security boundaries are defined in [Admin Portal and Scalable Architecture](ADMIN_PORTAL_ARCHITECTURE.md).
