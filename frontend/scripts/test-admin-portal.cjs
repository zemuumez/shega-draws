// Isolated UI contract tests. API/auth fixtures never modify a real account.
// Run against a development preview with NEXT_PUBLIC_API_BASE_URL set to the
// ADMIN_TEST_API origin. Install/provide Playwright separately for browser QA.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const web = process.env.ADMIN_TEST_WEB || "http://127.0.0.1:3101";
const api = process.env.ADMIN_TEST_API || "http://127.0.0.1:18081";
if (
  !["localhost", "127.0.0.1"].includes(new URL(web).hostname) ||
  !["localhost", "127.0.0.1"].includes(new URL(api).hostname)
)
  throw new Error("Local previews only");
const output =
  process.env.ADMIN_TEST_OUTPUT ||
  require("node:path").join(require("node:os").tmpdir(), "rimna-admin-browser");
const user = {
  id: "fixture-admin",
  name: "Demo Staff",
  email: "staff@example.test",
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
const draw = {
  id: "round-test",
  title: "Addis Weekly",
  currency: "ETB",
  priceMinor: 50000,
  capacity: 25000,
  status: "open",
  deadline: "2026-12-31T18:00:00Z",
  liveVideoUrl: "",
};
const rules = {
  deductions: [{ label: "Operations", bps: 2000 }],
  prizeBps: [3500, 2000, 1200, 800, 600, 500, 400, 400, 300, 300],
};
const templates = [
  {
    id: "weekly",
    title: "Addis Weekly",
    currency: "ETB",
    priceMinor: 50000,
    capacity: 25000,
    rules,
    active: true,
    version: 1,
  },
];
const rounds = [
  {
    ...draw,
    state: "draft",
    status: "closed",
    version: 1,
    templateId: "weekly",
    templateVersion: 1,
    rules,
    startedAt: null,
    closedAt: null,
    sold: 0,
    occupied: 0,
    remaining: 25000,
    currentNetMinor: 0,
    maximumNetMinor: 1000000000,
  },
];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.ADMIN_TEST_BROWSER
      ? { executablePath: process.env.ADMIN_TEST_BROWSER }
      : {}),
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    let role = "admin",
      signedIn = true,
      denied = false,
      apiOffline = false;
    const requests = [],
      writes = [],
      errors = [];
    await context.route("**/api/auth/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      let body = path.endsWith("/get-session")
        ? signedIn
          ? {
              user,
              session: {
                id: "fixture-session",
                userId: user.id,
                expiresAt: "2030-01-01T00:00:00Z",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }
          : null
        : path.endsWith("/token")
          ? { token: "fixture-only" }
          : { success: true };
      return route.fulfill({ json: body });
    });
    await context.route(`${api}/**`, async (route) => {
      const req = route.request(),
        url = new URL(req.url());
      requests.push(url.pathname);
      const headers = {
        "Access-Control-Allow-Origin": web,
        "Access-Control-Allow-Headers":
          "Authorization, Content-Type, Idempotency-Key",
        "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
      };
      if (req.method() === "OPTIONS")
        return route.fulfill({ status: 204, headers });
      if (apiOffline)
        return route.fulfill({
          status: 503,
          headers,
          json: { error: "Service temporarily unavailable" },
        });
      if (denied)
        return route.fulfill({
          status: 403,
          headers,
          json: { error: "Staff access required" },
        });
      if (req.method() === "PUT") {
        const body = req.postDataJSON();
        writes.push({ path: url.pathname, body });
        const id = url.pathname.split("/").at(-1);
        if (url.pathname.includes("/templates/")) {
          const i = templates.findIndex((t) => t.id === id);
          const next = { ...body, version: body.version + 1 };
          if (i < 0) templates.push(next);
          else templates[i] = next;
        }
        if (url.pathname.includes("/rounds/")) {
          const i = rounds.findIndex((r) => r.id === id);
          if (body.action === "save") {
            const next = {
              ...rounds[0],
              ...body,
              id,
              state: "draft",
              version: body.version + 1,
              startedAt: null,
              closedAt: null,
            };
            if (i < 0) rounds.push(next);
            else rounds[i] = next;
          } else {
            rounds[i] = {
              ...rounds[i],
              version: body.version + 1,
              state:
                body.action === "open"
                  ? "open"
                  : body.action === "pause"
                    ? "paused"
                    : "closed",
              startedAt: new Date().toISOString(),
              closedAt:
                body.action === "close" ? new Date().toISOString() : null,
            };
          }
        }
        return route.fulfill({ headers, json: { success: true } });
      }
      let body = [];
      if (url.pathname.endsWith("/session")) body = { role, userId: user.id };
      if (url.pathname.endsWith("/overview"))
        body = {
          openRounds: 3,
          issuedTickets: 120,
          pendingPayments: 2,
          refundRequired: 1,
          asOf: new Date().toISOString(),
          collections: [
            { currency: "ETB", paidMinor: 6000000, refundedMinor: 50000 },
            { currency: "USD", paidMinor: 12500, refundedMinor: 0 },
          ],
        };
      if (url.pathname.endsWith("/users"))
        body = {
          items:
            url.searchParams.get("q") === "missing"
              ? []
              : [{ ...user, role: "admin", twoFactorEnabled: true }],
          hasMore: false,
        };
      if (url.pathname.endsWith("/draws")) body = [draw];
      if (url.pathname.endsWith("/templates"))
        body = { items: templates, hasMore: false };
      if (url.pathname.endsWith("/rounds"))
        body = { items: rounds, hasMore: false };
      if (url.pathname.endsWith("/operations"))
        body = {
          salesPaused: false,
          recoveryLocked: false,
          reason: "",
          pendingPayments: 2,
          refundRequired: 1,
          workerLastSeen: null,
          backups: [],
        };
      return route.fulfill({ headers, json: body });
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${web}/admin`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page
      .getByRole("heading", { name: "Overview", exact: true })
      .waitFor();
    await page.getByText("Recorded collections", { exact: true }).waitFor();
    assert.equal(await page.locator(".admin-sidebar nav a").count(), 11);
    await page.screenshot({
      path: `${output}/desktop-overview.png`,
      fullPage: true,
    });
    await page.getByRole("link", { name: "Manage users", exact: true }).click();
    await page
      .getByRole("cell", { name: "staff@example.test", exact: true })
      .waitFor();
    await page
      .getByRole("textbox", { name: "Search users by name or email" })
      .fill("missing");
    await page.getByText("No accounts match your search.").waitFor();
    await page
      .getByRole("textbox", { name: "Search users by name or email" })
      .fill("Demo");
    await page
      .getByRole("cell", { name: "staff@example.test", exact: true })
      .waitFor();
    await page.screenshot({
      path: `${output}/desktop-users.png`,
      fullPage: true,
    });
    await page
      .getByRole("link", { name: "Lotteries & rounds", exact: true })
      .click();
    await page
      .getByRole("button", { name: "New lottery", exact: true })
      .click();
    await page
      .getByLabel("Title", { exact: true })
      .fill("Browser test lottery");
    await page.getByLabel("Ticket price", { exact: true }).fill("500.25");
    await page.getByLabel("Ticket capacity", { exact: true }).fill("1000");
    for (let i = 1; i <= 10; i++)
      await page.getByLabel(`Rank ${i} %`, { exact: true }).fill("9");
    await page
      .getByRole("button", { name: "Save template", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "total exactly 100%" })
      .waitFor();
    const prior = writes.length;
    for (let i = 1; i <= 10; i++)
      await page.getByLabel(`Rank ${i} %`, { exact: true }).fill("10");
    await page
      .getByRole("button", { name: "Save template", exact: true })
      .click();
    await page
      .getByText(
        "Lottery defaults saved. Existing rounds keep their own rules.",
      )
      .waitFor();
    assert.equal(writes.length, prior + 1);
    assert.equal(writes.at(-1).body.priceMinor, 50025);
    await page
      .locator(".admin-template")
      .filter({ hasText: "Addis Weekly" })
      .getByRole("button", { name: "New round", exact: true })
      .click();
    await page.getByLabel("Title", { exact: true }).fill("New weekly round");
    await page
      .getByLabel("Sales deadline (your local time)", { exact: true })
      .fill("2099-12-31T18:00");
    await page
      .getByRole("button", { name: "Save draft round", exact: true })
      .click();
    await page
      .getByText(
        "Round saved as a draft. Review its rules before opening sales.",
      )
      .waitFor();
    assert.equal(writes.at(-1).body.templateVersion, 1);
    assert.deepEqual(writes.at(-1).body.rules, rules);
    const row = page.getByRole("row").filter({ hasText: "Addis Weekly" });
    await row.getByRole("button", { name: "Edit draft", exact: true }).click();
    await page.screenshot({
      path: `${output}/round-editor.png`,
      fullPage: true,
    });
    await page.getByLabel("Title", { exact: true }).fill("Updated test round");
    await page
      .getByRole("button", { name: "Save draft round", exact: true })
      .click();
    await page.waitForFunction(
      () => !document.querySelector(".admin-round-editor"),
    );
    assert.equal(writes.at(-1).body.title, "Updated test round");
    const updated = page
      .getByRole("row")
      .filter({ hasText: "Updated test round" });
    await updated
      .getByRole("button", { name: "Open sales", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Open sales and lock rules", exact: true })
      .click();
    await updated
      .getByRole("button", { name: "Pause sales", exact: true })
      .waitFor();
    assert.equal(
      await updated
        .getByRole("button", { name: "Edit draft", exact: true })
        .count(),
      0,
    );
    await updated
      .getByRole("button", { name: "Pause sales", exact: true })
      .click();
    await updated
      .getByRole("button", { name: "Resume sales", exact: true })
      .waitFor();
    await updated
      .getByRole("button", { name: "Close round", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm permanent closure", exact: true })
      .click();
    await page
      .getByText(
        "Round closed permanently to new purchases. Existing payments are still checked.",
      )
      .waitFor();
    await updated
      .getByRole("button", { name: "Resume sales", exact: true })
      .waitFor({ state: "hidden" });
    assert.equal(
      await updated
        .getByRole("button", { name: "Resume sales", exact: true })
        .count(),
      0,
    );
    await updated
      .getByRole("button", { name: "View rules", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Share of net prize fund", exact: true })
      .waitFor();
    await page.screenshot({
      path: `${output}/desktop-rounds.png`,
      fullPage: true,
    });
    for (const id of [
      "orders",
      "results",
      "legacy",
      "messages",
      "audit",
      "advertisers",
      "operations",
      "content",
    ]) {
      await page.goto(`${web}/admin/${id}`, { waitUntil: "networkidle" });
      await page.locator(".admin-workspace h1").waitFor();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${web}/admin/users`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Navigation", exact: true }).click();
    await page
      .getByRole("link", { name: "Lotteries & rounds", exact: true })
      .click();
    await page
      .getByRole("button", { name: "View rules", exact: true })
      .first()
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Navigation", exact: true })
        .getAttribute("aria-expanded"),
      "false",
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      true,
      "mobile page overflows",
    );
    await page.screenshot({
      path: `${output}/mobile-rounds.png`,
      fullPage: true,
    });
    role = "reviewer";
    await page.goto(`${web}/admin`, { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "New lottery", exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "New lottery", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal(
      await page.locator('.admin-sidebar a[href="/admin/users"]').count(),
      0,
    );
    const before = requests.filter((p) => p.endsWith("/users")).length;
    await page.goto(`${web}/admin/users`, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "This workspace is unavailable" })
      .waitFor();
    assert.equal(
      requests.filter((p) => p.endsWith("/users")).length,
      before,
      "reviewer user data fetched",
    );
    denied = true;
    await page.goto(`${web}/admin`, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "Staff access unavailable" })
      .waitFor();
    assert.equal(await page.locator(".admin-sidebar").count(), 0);
    denied = false;
    apiOffline = true;
    await page.getByRole("button", { name: "Check again" }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Service temporarily unavailable" })
      .waitFor();
    signedIn = false;
    apiOffline = false;
    await page.goto(`${web}/admin`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Staff sign in" }).waitFor();
    assert.equal(await page.locator(".admin-sidebar").count(), 0);
    assert.deepEqual(errors, []);
    console.log(
      "Passed: admin navigation, template and round forms, locked rules and lifecycle controls, user search/empty state, mobile layout, reviewer restrictions, denied/failed/unauthenticated gates. API/auth responses were fixtures.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
