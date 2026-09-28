const test = require("node:test"),
  assert = require("node:assert/strict"),
  ts = require("typescript"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path");
const exportsObject = {};
vm.runInNewContext(
  ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "../lib/auth-mail.ts"), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText,
  { exports: exportsObject },
);
const smtp = exportsObject.smtpOptions;
const env = {
  NODE_ENV: "production",
  SMTP_HOST: "mail.example.test",
  SMTP_PORT: "465",
  SMTP_FROM: "accounts@example.test",
  SMTP_USER: "fixture",
  SMTP_PASSWORD: "fixture-only",
};
test("remote SMTP uses TLS and validates certificates without logging credentials", () => {
  const o = smtp(env);
  assert.equal(o.secure, true);
  assert.equal(o.tls.rejectUnauthorized, true);
  assert.equal(o.debug, false);
  assert.equal(o.auth.user, "fixture");
  assert.ok(o.socketTimeout <= 15000);
});
test("587 requires STARTTLS, missing remote credentials and bad ports fail closed", () => {
  assert.equal(smtp({ ...env, SMTP_PORT: "587" }).requireTLS, true);
  for (const overrides of [
    { SMTP_PASSWORD: "" },
    { SMTP_USER: "" },
    { SMTP_PORT: "NaN" },
    { SMTP_PORT: "0" },
    { SMTP_PORT: "65536" },
  ])
    assert.throws(() => smtp({ ...env, ...overrides }));
});
test("only a development loopback mail catcher may omit authentication and TLS", () => {
  const local = {
    NODE_ENV: "development",
    SMTP_HOST: "localhost",
    SMTP_PORT: "1027",
    SMTP_FROM: "test@example.test",
  };
  assert.equal(smtp(local).requireTLS, false);
  assert.throws(() => smtp({ ...local, NODE_ENV: "production" }));
  assert.throws(() => smtp({ ...local, SMTP_HOST: "remote.example.test" }));
});
