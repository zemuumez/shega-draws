import { betterAuth, type BetterAuthOptions } from "better-auth";
import { jwt, twoFactor } from "better-auth/plugins";
import { Pool } from "pg";
import nodemailer from "nodemailer";

let instance: ReturnType<typeof betterAuth> | undefined;
let pool: Pool | undefined;
export function authOptions(): BetterAuthOptions {
  const baseURL = process.env.BETTER_AUTH_URL;
  const secret = process.env.BETTER_AUTH_SECRET;
  const connectionString = process.env.AUTH_DATABASE_URL;
  if (!baseURL || !secret || secret.length < 32 || !connectionString)
    throw new Error("Authentication configuration is incomplete.");
  if (process.env.NODE_ENV === "production" && !baseURL.startsWith("https://"))
    throw new Error("Authentication requires HTTPS.");
  pool ||= new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    options: "-c search_path=auth",
  });
  async function send(to: string | undefined, subject: string, url: string) {
    if (!to) throw new Error("Email is required.");
    if (!process.env.SMTP_HOST || !process.env.SMTP_FROM)
      throw new Error("Verification email delivery is not configured.");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
      ...(process.env.SMTP_USER
        ? {
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          }
        : {}),
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: `${subject}\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
    });
  }
  return {
    appName: "Rimna",
    baseURL,
    secret,
    database: pool,
    trustedOrigins: [baseURL],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: { email?: string };
        url: string;
      }) => send(user.email, "Reset your Rimna password", url),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({
        user,
        url,
      }: {
        user: { email?: string };
        url: string;
      }) => send(user.email, "Verify your Rimna email", url),
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    rateLimit: {
      enabled: true,
      storage: "database" as const,
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
        "/request-password-reset": { window: 60, max: 3 },
      },
    },
    plugins: [
      twoFactor({ issuer: "Rimna" }),
      jwt({
        jwks: {
          keyPairConfig: { alg: "EdDSA" as const, crv: "Ed25519" as const },
          rotationInterval: 60 * 60 * 24 * 30,
        },
        jwt: {
          issuer: baseURL,
          audience: "rimna-api",
          expirationTime: "3m",
          definePayload: ({ user, session }: { user: any; session: any }) => ({
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            sessionId: session.id,
          }),
        },
      }),
    ],
  };
}
export function getAuth() {
  return (instance ||= betterAuth(authOptions()));
}
