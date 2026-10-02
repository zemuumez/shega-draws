import { betterAuth, type BetterAuthOptions } from "better-auth";
import { jwt, twoFactor } from "better-auth/plugins";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { smtpOptions } from "./auth-mail";
import { phoneAndTelegramAuthPlugin } from "./auth-extensions";

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
    const transport = nodemailer.createTransport(smtpOptions());
    const isReset = subject.toLowerCase().includes("reset");
    const buttonText = isReset ? "Reset Your Password" : "Verify Email Address";
    const heading = isReset ? "Password Reset Request" : "Verify Your Email";
    const explanation = isReset
      ? "We received a request to reset your password for your Rimna account. Click the button below to choose a new password:"
      : "Thank you for creating an account with Rimna. Please confirm your email address by clicking the button below:";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f17; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; border-bottom: 2px solid #fde047;">
              <h1 style="margin: 0; color: #fde047; font-size: 24px; font-weight: 800; letter-spacing: 1px;">
                🏛️ RIMNA LOTTERY
              </h1>
              <p style="margin: 6px 0 0; color: #9ca3af; font-size: 13px;">Official Security Notification</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 20px; font-weight: 700;">${heading}</h2>
              <p style="margin: 0 0 24px; color: #d1d5db; font-size: 15px; line-height: 1.6;">${explanation}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${url}" target="_blank" style="background-color: #fde047; color: #111827; font-size: 16px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 14px rgba(253, 224, 71, 0.4);">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 12px; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; word-break: break-all; font-size: 12px; color: #60a5fa;">
                <a href="${url}" style="color: #60a5fa; text-decoration: underline;">${url}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #1f2937; margin: 24px 0;" />
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                If you did not make this request, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0b0f17; padding: 20px; text-align: center; border-top: 1px solid #1f2937;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} Rimna International Digital Lottery. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: `${subject}\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
      html,
    });
  }
  return {
    appName: "Rimna",
    baseURL,
    secret,
    database: pool,
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "facebook"],
      },
    },
    trustedOrigins: [
      baseURL,
      "https://shega-draws.loca.lt",
      "https://calm-puma-52.loca.lt",
    ].filter(Boolean) as string[],
    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              prompt: "select_account",
            },
          }
        : {}),
      ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
        ? {
            facebook: {
              clientId: process.env.FACEBOOK_CLIENT_ID,
              clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            },
          }
        : {}),
    },
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
        "/send-verification-email": { window: 60, max: 3 },
        "/reset-password": { window: 60, max: 5 },
        "/two-factor/*": { window: 60, max: 5 },
        "/phone/*": { window: 60, max: 10 },
        "/telegram/*": { window: 60, max: 10 },
      },
    },
    plugins: [
      twoFactor({ issuer: "Rimna" }),
      phoneAndTelegramAuthPlugin(),
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
  if (process.env.NODE_ENV !== "production") {
    return betterAuth(authOptions());
  }
  return (instance ||= betterAuth(authOptions()));
}
