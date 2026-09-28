// Local UI contracts: all authentication and payment responses are fixtures.
const { chromium } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const web = "http://127.0.0.1:3101",
  api = "http://127.0.0.1:18081",
  output = "/private/tmp/rimna-wallet-browser";
const user = {
    id: "wallet-fixture",
    name: "Wallet Tester",
    email: "wallet@example.test",
    emailVerified: true,
  },
  now = new Date().toISOString();
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  try {
    const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      }),
      errors = [],
      posts = [],
      writes = [];
    let deposits = [],
      failed = false,
      paused = false,
      role = "admin";
    await context.route("**/api/auth/**", (r) =>
      r.fulfill({
        json: r.request().url().includes("get-session")
          ? {
              user,
              session: {
                id: "session",
                userId: user.id,
                expiresAt: "2030-01-01T00:00:00Z",
                createdAt: now,
                updatedAt: now,
              },
            }
          : { token: "fixture-token" },
      }),
    );
    await context.route(`${api}/**`, async (route) => {
      const r = route.request(),
        url = new URL(r.url()),
        p = url.pathname,
        headers = {
          "Access-Control-Allow-Origin": web,
          "Access-Control-Allow-Headers":
            "Authorization,Content-Type,Idempotency-Key",
          "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        };
      if (r.method() === "OPTIONS")
        return route.fulfill({ status: 204, headers });
      if (r.method() === "POST") {
        posts.push({
          key: r.headers()["idempotency-key"],
          body: r.postDataJSON(),
        });
        if (!failed) {
          failed = true;
          return route.fulfill({
            status: 503,
            headers,
            json: { error: "Connection interrupted. Retry the same request." },
          });
        }
        deposits = [
          {
            id: "dep_browser",
            currency: "ETB",
            amountMinor: 1050,
            provider: "chapa",
            mode: "test",
            status: "pending",
            checkoutUrl: "https://checkout.chapa.co/payment/fixture",
            paymentReference: "receipt-fixture",
            createdAt: now,
            creditedAt: null,
            reversedAt: null,
            reviewReason: "",
          },
        ];
        return route.fulfill({ headers, json: deposits[0] });
      }
      if (r.method() === "PUT") {
        const body = r.postDataJSON();
        writes.push({ path: p, body });
        if (p.endsWith("/operations/deposits")) paused = body.paused;
        return route.fulfill({ headers, json: { success: true } });
      }
      let body = [];
      if (p === "/v1/wallet")
        body = {
          balances: ["ETB", "USD"].map((currency) => ({
            currency,
            balanceMinor: currency === "ETB" ? 2500 : 0,
            availableMinor: currency === "ETB" ? 2500 : 0,
            pendingMinor: 0,
            restricted: false,
          })),
          depositPolicy: {
            enabled: true,
            currency: "ETB",
            minMinor: 100,
            maxMinor: 100000,
          },
          methods: ["chapa"],
          mode: "test",
          walletPurchasesEnabled: false,
        };
      if (p === "/v1/wallet/history")
        body = {
          items:
            url.searchParams.get("currency") === "ETB"
              ? [
                  {
                    id: 1,
                    kind: "deposit",
                    reference: "dep_previous",
                    currency: "ETB",
                    amountMinor: 2500,
                    balanceAfterMinor: 2500,
                    createdAt: now,
                  },
                ]
              : [],
          hasMore: false,
        };
      if (p.endsWith("/deposits")) body = { items: deposits, hasMore: false };
      if (p === "/v1/admin/wallets")
        body = ["ETB", "USD"].map((currency) => ({
          currency,
          customerBalanceMinor: currency === "ETB" ? 2500 : 0,
          ledgerBalanceMinor: currency === "ETB" ? 2500 : 0,
          mismatchedAccounts: 0,
          restrictedAccounts: 0,
        }));
      if (p === "/v1/admin/session") body = { role, userId: user.id };
      if (p === "/v1/admin/operations")
        body = { depositsPaused: paused, recoveryLocked: false };
      return route.fulfill({ headers, json: body });
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${web}/account`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    const wallet = page.getByRole("region", { name: "My wallet" });
    await wallet
      .getByRole("heading", { name: "My wallet", exact: true })
      .waitFor();
    await wallet.getByText("ETB 25.00", { exact: true }).waitFor();
    await wallet.getByRole("button", { name: "USD", exact: true }).click();
    await wallet
      .getByText("No balance entries yet.", { exact: true })
      .waitFor();
    await wallet
      .getByText("New deposits are currently unavailable for this currency.")
      .waitFor();
    await wallet.getByRole("button", { name: "ETB", exact: true }).click();
    await wallet.getByLabel("Deposit amount", { exact: true }).fill("10.50");
    await wallet
      .getByLabel("Deposit phone number", { exact: true })
      .fill("+251911123456");
    await wallet
      .getByRole("button", { name: "Continue to Chapa", exact: true })
      .click();
    await wallet
      .getByText("Connection interrupted. Retry the same request.", {
        exact: true,
      })
      .waitFor();
    await page.reload({ waitUntil: "networkidle" });
    await wallet
      .getByRole("button", { name: "Retry same deposit", exact: true })
      .click();
    await wallet
      .getByRole("link", { name: "Continue payment", exact: true })
      .waitFor();
    assert.equal(posts.length, 2);
    assert.equal(posts[0].key, posts[1].key);
    assert.deepEqual(posts[0].body, posts[1].body);
    assert.equal(posts[0].body.amountMinor, 1050);
    assert.equal(
      await wallet
        .getByRole("link", { name: "Continue payment" })
        .getAttribute("href"),
      "https://checkout.chapa.co/payment/fixture",
    );
    await page.screenshot({
      path: `${output}/player-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `${output}/player-mobile.png`,
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${web}/admin/wallets`, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "Wallet accounting", exact: true })
      .waitFor();
    await page.getByLabel("Deposit control reason").fill("Review test funding");
    await page
      .getByRole("button", { name: "Pause new deposits", exact: true })
      .click();
    await page
      .getByText("Deposit controls updated and recorded in the audit history.")
      .waitFor();
    assert.equal(writes[0].body.paused, true);
    await page
      .getByRole("button", { name: "Verify payment", exact: true })
      .click();
    assert.equal(
      await page.getByLabel("Chapa payment reference").getAttribute("readonly"),
      "",
    );
    await page
      .getByRole("button", { name: "Schedule verification", exact: true })
      .click();
    await page
      .getByText(
        "Verification scheduled. Refresh later to see the verified outcome.",
      )
      .waitFor();
    assert.deepEqual(writes[1], {
      path: "/v1/admin/deposits/dep_browser",
      body: { reference: "receipt-fixture" },
    });
    await page.screenshot({
      path: `${output}/admin-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `${output}/admin-mobile.png`,
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    role = "reviewer";
    await page.goto(`${web}/admin/wallets`, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "This workspace is unavailable" })
      .waitFor();
    assert.equal(
      await page.locator('.admin-sidebar a[href="/admin/wallets"]').count(),
      0,
    );
    assert.deepEqual(errors, []);
    console.log(
      "Passed: currency separation, exact amounts, retry after reload, checkout link, staff pause/reference controls, reviewer denial and mobile layout. API/auth fixtures only.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
