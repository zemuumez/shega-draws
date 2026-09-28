import type SMTPTransport from "nodemailer/lib/smtp-transport";

// Remote mail is encrypted and authenticated. Only a local development mail
// catcher can run without TLS/login; production never takes that exception.
export function smtpOptions(
  env: NodeJS.ProcessEnv = process.env,
): SMTPTransport.Options {
  const host = env.SMTP_HOST?.trim();
  const port = Number(env.SMTP_PORT || 587);
  if (
    !host ||
    !env.SMTP_FROM ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  )
    throw new Error("Email delivery configuration is incomplete.");
  const local =
    env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1", "::1"].includes(host);
  if (!local && (!env.SMTP_USER || !env.SMTP_PASSWORD))
    throw new Error("Authenticated email delivery is not configured.");
  return {
    host,
    port,
    secure: port === 465,
    requireTLS: !local && port !== 465,
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2", servername: host },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    logger: false,
    debug: false,
    ...(env.SMTP_USER
      ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } }
      : {}),
  };
}
