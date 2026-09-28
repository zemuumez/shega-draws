import type { RecordSection } from "@/components/admin/AdminRecordsPanel";
export type StaffRole = "admin" | "reviewer";
export const adminSections = [
  {
    id: "overview",
    title: "Overview",
    description: "A clear view of sales and the work that needs attention.",
    adminOnly: true,
  },
  {
    id: "draws",
    title: "Lotteries & rounds",
    description: "Manage ticket prices, capacity and fixed sales deadlines.",
  },
  {
    id: "results",
    title: "Draw management",
    description: "Record the verified results of your live draw.",
  },
  {
    id: "users",
    title: "Manage users",
    description:
      "Find registered accounts and review their verification status.",
    adminOnly: true,
  },
  {
    id: "orders",
    title: "Financial review",
    description: "Review ticket payments and reconcile provider transactions.",
  },
  {
    id: "messages",
    title: "Support & messages",
    description: "Review customer messages and subscriptions.",
  },
  {
    id: "audit",
    title: "Reports & audit",
    description: "Review recorded staff actions and their references.",
    adminOnly: true,
  },
  {
    id: "legacy",
    title: "Imported receipts",
    description: "Review historical tickets and original payment evidence.",
  },
  {
    id: "advertisers",
    title: "Affiliates",
    description: "Manage existing affiliate records and commissions.",
    adminOnly: true,
  },
  {
    id: "operations",
    title: "System operations",
    description: "Control new sales and review backup and worker status.",
    adminOnly: true,
  },
  {
    id: "content",
    title: "Website content",
    description: "Manage branding, translations and website content in Sanity.",
  },
] as const;
export type AdminSection = (typeof adminSections)[number]["id"];
export function visibleSections(role: StaffRole) {
  return adminSections.filter(
    (s) => !("adminOnly" in s && s.adminOnly) || role === "admin",
  );
}
export function recordSection(id: AdminSection): id is RecordSection {
  return [
    "results",
    "orders",
    "messages",
    "audit",
    "legacy",
    "advertisers",
  ].includes(id);
}
export function money(minor: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(minor / 100);
}
export interface AdminOverviewData {
  openRounds: number;
  issuedTickets: number;
  pendingPayments: number;
  refundRequired: number;
  collections: { currency: string; paidMinor: number; refundedMinor: number }[];
  asOf: string;
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  role: string;
  createdAt: string;
}
