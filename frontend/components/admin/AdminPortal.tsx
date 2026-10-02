"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  Ticket,
  Trophy,
  Users,
  CreditCard,
  Headphones,
  History,
  FileArchive,
  Megaphone,
  Settings,
  Globe,
  LogOut,
  Menu,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { accountAPI, clearAccountToken } from "@/lib/account-api";
import {
  visibleSections,
  adminSections,
  recordSection,
  type StaffRole,
} from "@/lib/admin";
import { AccountPanel } from "../AccountPanel";
import { AdminOverview } from "./AdminOverview";
import { AdminUsers } from "./AdminUsers";
const AdminLotteries = dynamic(
  () => import("./AdminLotteries").then((m) => m.AdminLotteries),
  { loading: () => <p role="status">Loading lotteries…</p> },
);
const AdminRecordsPanel = dynamic(
  () => import("./AdminRecordsPanel").then((m) => m.AdminRecordsPanel),
  { loading: () => <p role="status">Loading workspace…</p> },
);
const AdminWallets = dynamic(() =>
  import("./AdminWallets").then((m) => m.AdminWallets),
);
const AdminFinancialReview = dynamic(
  () => import("./AdminFinancialReview").then((m) => m.AdminFinancialReview),
  { loading: () => <p role="status">Loading financial review…</p> },
);
const AdminReportsAudit = dynamic(
  () => import("./AdminReportsAudit").then((m) => m.AdminReportsAudit),
  { loading: () => <p role="status">Loading reports & audit…</p> },
);
const OperationsPanel = dynamic(() =>
  import("../OperationsPanel").then((m) => m.OperationsPanel),
);
const icons = {
  overview: LayoutDashboard,
  draws: Ticket,
  results: Trophy,
  users: Users,
  orders: CreditCard,
  wallets: CreditCard,
  messages: Headphones,
  audit: History,
  legacy: FileArchive,
  advertisers: Megaphone,
  operations: Settings,
  content: Globe,
};
export function AdminPortal() {
  const { data: session, isPending } = authClient.useSession();
  const [access, setAccess] = useState<{
      userId: string;
      role: StaffRole;
    } | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [menu, setMenu] = useState(false),
    [signingOut, setSigningOut] = useState(false);
  const path = usePathname(),
    router = useRouter();
  useEffect(() => {
    setAccess(null);
    setError("");
    if (!session?.user.emailVerified) return;
    clearAccountToken();
    const c = new AbortController();
    accountAPI<{ role: StaffRole; userId: string }>("/admin/session", {
      signal: c.signal,
    })
      .then((v) => {
        if (
          v.userId !== session.user.id ||
          (v.role !== "admin" && v.role !== "reviewer")
        )
          throw new Error("Staff access is required.");
        if (!c.signal.aborted)
          setAccess({ userId: session.user.id, role: v.role });
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [session?.user.id, session?.user.emailVerified, retry]);
  useEffect(() => setMenu(false), [path]);
  const role = access?.userId === session?.user.id ? access?.role : undefined;
  const requested = path.replace(/^\/admin\/?/, "");
  const section = adminSections.find(
    (s) => s.id === (requested || (role === "reviewer" ? "draws" : "overview")),
  );
  const allowed =
    role && section && visibleSections(role).some((s) => s.id === section.id);
  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      const r = await authClient.signOut();
      if (r.error) throw new Error(r.error.message || "Could not sign out");
      clearAccountToken();
      setAccess(null);
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSigningOut(false);
    }
  }
  if (isPending)
    return (
      <div className="admin-portal admin-gate" role="status">
        Checking your session…
      </div>
    );
  if (!session?.user.emailVerified)
    return (
      <div className="admin-portal admin-gate">
        <div className="admin-card">
          <span className="admin-eyebrow">RIMNA OPERATIONS</span>
          <h1>Staff sign in</h1>
          <p>
            Use your verified staff account. Administrator access requires an
            authenticator.
          </p>
          <AccountPanel compact />
          <Link href="/">Back to the website</Link>
        </div>
      </div>
    );
  if (!role)
    return (
      <div className="admin-portal admin-gate">
        <div className="admin-card">
          <ShieldCheck size={32} />
          <h1>
            {error ? "Staff access unavailable" : "Checking staff access…"}
          </h1>
          {error ? (
            <>
              <p role="alert">{error}</p>
              <p>
                Only assigned staff with two-factor authentication can enter
                this workspace.
              </p>
              <button onClick={() => setRetry((v) => v + 1)}>
                Check again
              </button>
              <Link href="/account">Account & authenticator settings</Link>
            </>
          ) : (
            <p role="status">Verifying your permissions.</p>
          )}
        </div>
      </div>
    );
  return (
    <div className="admin-portal">
      <a className="admin-skip" href="#admin-workspace">
        Skip navigation
      </a>
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <Image
            src="/images/rimna-brand-logo.png"
            alt="Rimna"
            width={36}
            height={36}
            className="admin-brand-logo"
            style={{ borderRadius: 8, objectFit: "contain" }}
          />
          <div>
            Rimna<small>Operations center</small>
          </div>
        </Link>
        <button
          className="admin-menu"
          aria-expanded={menu}
          aria-controls="admin-navigation"
          onClick={() => setMenu((v) => !v)}
        >
          <Menu size={20} /> Navigation
        </button>
        <nav
          id="admin-navigation"
          aria-label="Administration"
          className={menu ? "is-open" : ""}
        >
          <p className="admin-nav-label">ADMINISTRATION</p>
          {visibleSections(role).map((s) => {
            const Icon = icons[s.id];
            return (
              <Link
                key={s.id}
                href={`/admin/${s.id}`}
                aria-current={section?.id === s.id ? "page" : undefined}
              >
                <Icon size={18} />
                <span>{s.title}</span>
                {section?.id === s.id && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/">
            <Globe size={17} /> Visit website <ArrowUpRight size={15} />
          </Link>
          <button disabled={signingOut} onClick={() => void signOut()}>
            <LogOut size={17} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            Administration <ChevronRight size={14} />{" "}
            <strong>{section?.title || "Page not found"}</strong>
          </span>
          <div>
            <span className="admin-access">
              <ShieldCheck size={15} />
              {role === "admin" ? "Administrator" : "Reviewer"}
            </span>
            <span className="admin-avatar" title={session.user.name}>
              {session.user.name?.slice(0, 1).toUpperCase() || "R"}
            </span>
          </div>
        </header>
        <div id="admin-workspace" tabIndex={-1} className="admin-workspace">
          <div className="admin-page-heading">
            <p className="admin-eyebrow">OPERATIONS CENTER</p>
            <h1>{section?.title || "Page not found"}</h1>
            <p>
              {section?.description ||
                "Choose a workspace from the navigation."}
            </p>
          </div>
          {error && (
            <p className="admin-alert" role="alert">
              {error}
            </p>
          )}
          {!allowed ? (
            <div className="admin-card">
              <h2>This workspace is unavailable</h2>
              <p>The page does not exist or your role does not have access.</p>
              <Link href="/admin">Return to your workspace</Link>
            </div>
          ) : (
            <>
              {section.id === "overview" && <AdminOverview />}
              {section.id === "users" && <AdminUsers />}
              {section.id === "wallets" && <AdminWallets />}
              {section.id === "orders" && (
                <AdminFinancialReview canWrite={role === "admin"} />
              )}
              {section.id === "audit" && (
                <AdminReportsAudit canWrite={role === "admin"} />
              )}
              {section.id === "draws" && (
                <AdminLotteries canWrite={role === "admin"} />
              )}
              {section.id === "operations" && (
                <section className="admin-card">
                  <OperationsPanel />
                </section>
              )}
              {section.id === "content" && (
                <section className="admin-card">
                  <Globe size={28} />
                  <h2>Website content & languages</h2>
                  <p>
                    Manage branding, page content, advertisements, testimonials
                    and English, Amharic and Tigrinya translations in Sanity.
                  </p>
                  <Link className="admin-button admin-primary" href="/studio">
                    Open content studio <ArrowUpRight size={17} />
                  </Link>
                  <p className="admin-muted">
                    Content Studio uses its own permissions. It cannot grant
                    staff access or approve payments.
                  </p>
                </section>
              )}
              {section.id !== "orders" && section.id !== "audit" && recordSection(section.id) && (
                <section className="admin-card">
                  {section.id === "results" && (
                    <p className="admin-notice">
                      Results use the existing publication workflow. Independent
                      approval and the external prize-settlement register are
                      still pending.
                    </p>
                  )}
                  <AdminRecordsPanel
                    key={section.id}
                    section={section.id}
                    canWrite={role === "admin"}
                  />
                </section>
              )}
            </>
          )}
          <footer className="admin-footer">
            <span>Rimna · Staff workspace</span>
            <span>Private account and operational records</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
