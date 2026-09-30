export interface Deposit {
  accountId?: string;
  id: string;
  currency: string;
  amountMinor: number;
  provider: string;
  mode: string;
  status: string;
  checkoutUrl: string;
  paymentReference: string;
  createdAt: string;
  creditedAt: string | null;
  reversedAt: string | null;
  reviewReason: string;
}
export interface WalletEntry {
  id: number;
  kind: string;
  reference: string;
  currency: string;
  amountMinor: number;
  balanceAfterMinor: number;
  createdAt: string;
}
export interface WalletData {
  balances: {
    currency: string;
    balanceMinor: number;
    availableMinor: number;
    pendingMinor: number;
    restricted: boolean;
  }[];
  depositPolicy: {
    enabled: boolean;
    currency: string;
    minMinor: number;
    maxMinor: number;
  };
  methods: string[];
  mode: string;
  walletPurchasesEnabled: boolean;
}
export interface WalletReport {
  currency: string;
  customerBalanceMinor: number;
  ledgerBalanceMinor: number;
  mismatchedAccounts: number;
  restrictedAccounts: number;
}
export interface WalletPage<T> {
  items: T[];
  hasMore: boolean;
}
export function checkoutLink(d: Deposit): string | undefined {
  if (d.status !== "pending" || d.creditedAt || !d.checkoutUrl) return;
  try {
    const u = new URL(d.checkoutUrl);
    // Allow local Chapa sandbox simulator in test/demo mode
    if (
      (u.protocol === "http:" || u.protocol === "https:") &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1") &&
      u.pathname.startsWith("/chapa-sandbox")
    ) {
      return u.href;
    }
    if (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      (d.provider === "chapa"
        ? ["checkout.chapa.co", "checkout.chapa.global"].includes(u.hostname)
        : d.provider === "stripe" && u.hostname === "checkout.stripe.com")
    )
      return u.href;
  } catch {
    /* Invalid provider URL must not become a clickable link. */
  }
}
