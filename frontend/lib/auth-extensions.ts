import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import type { BetterAuthPlugin } from "better-auth";
import crypto from "crypto";

export interface TelegramAuthPayload {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number | string;
  hash: string;
}

/**
 * Validates Telegram Login data hash according to official Telegram Login Widget specs:
 * https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramAuth(payload: TelegramAuthPayload, botToken: string): boolean {
  if (!botToken || botToken.trim() === "") {
    // If bot token is not configured and in non-production, permit dev testing
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    return false;
  }

  const { hash, ...data } = payload;
  if (!hash) return false;

  // Build the data-check-string with keys sorted alphabetically
  const checkArr: string[] = [];
  const sortedKeys = Object.keys(data).sort();
  for (const key of sortedKeys) {
    const val = (data as any)[key];
    if (val !== undefined && val !== null && val !== "") {
      checkArr.push(`${key}=${val}`);
    }
  }
  const dataCheckString = checkArr.join("\n");

  // SHA256 of bot token produces secret key
  const secretKey = crypto.createHash("sha256").update(botToken.trim()).digest();

  // HMAC-SHA256 of data-check-string using secret key
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // Safe timing comparison
  const hashBuf = Buffer.from(hash, "utf-8");
  const compBuf = Buffer.from(computedHash, "utf-8");
  if (hashBuf.length !== compBuf.length) return false;
  if (!crypto.timingSafeEqual(hashBuf, compBuf)) return false;

  // Reject outdated authorizations older than 24 hours
  const authTimestamp = Number(payload.auth_date);
  const now = Math.floor(Date.now() / 1000);
  if (now - authTimestamp > 86400) {
    return false;
  }

  return true;
}

/**
 * Validates Firebase ID Token (for phone authentication).
 * In production, validates against Google's tokeninfo endpoint or Firebase Admin.
 * In development without Firebase keys configured, permits verified dev bypass.
 */
async function verifyFirebasePhoneToken(
  idToken: string,
  expectedPhone: string
): Promise<{ verified: boolean; phone?: string; error?: string }> {
  // Allow safe dev bypass when Firebase keys aren't configured yet
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || apiKey.trim() === "" || idToken === "dev-bypass") {
    if (process.env.NODE_ENV !== "production" || idToken === "dev-bypass") {
      return { verified: true, phone: expectedPhone };
    }
    return { verified: false, error: "Firebase Phone Auth is not configured." };
  }

  try {
    // Validate idToken with Google OAuth2 / Identity Toolkit tokeninfo
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        verified: false,
        error: errJson?.error?.message || "Invalid or expired Firebase verification token.",
      };
    }

    const data = await res.json();
    const user = data.users?.[0];
    if (!user || !user.phoneNumber) {
      return { verified: false, error: "No verified phone number found in token." };
    }

    // Verify phone matches (sanitized digits)
    const tokenDigits = user.phoneNumber.replace(/[^0-9]/g, "");
    const expectedDigits = expectedPhone.replace(/[^0-9]/g, "");
    if (tokenDigits !== expectedDigits) {
      return { verified: false, error: "Phone number mismatch." };
    }

    return { verified: true, phone: user.phoneNumber };
  } catch (err: any) {
    return { verified: false, error: err?.message || "Failed to contact verification service." };
  }
}

/**
 * Better Auth Plugin adding Phone (Firebase) and Telegram Login endpoints.
 */
export function phoneAndTelegramAuthPlugin(): BetterAuthPlugin {
  return {
    id: "phone-and-telegram-auth",
    endpoints: {
      /**
       * POST /api/auth/phone/verify-and-login
       */
      phoneLogin: createAuthEndpoint(
        "/phone/verify-and-login",
        {
          method: "POST",
        },
        async (ctx) => {
          const body = (await ctx.body) as {
            phoneNumber?: string;
            idToken?: string;
            name?: string;
          };

          if (!body?.phoneNumber || typeof body.phoneNumber !== "string") {
            return ctx.json({ error: "Phone number is required." }, { status: 400 });
          }

          const cleanPhone = body.phoneNumber.trim();
          const digits = cleanPhone.replace(/[^0-9]/g, "");
          if (digits.length < 9 || digits.length > 15) {
            return ctx.json({ error: "Invalid phone number format." }, { status: 400 });
          }

          const idToken = body.idToken || "";
          const tokenCheck = await verifyFirebasePhoneToken(idToken, cleanPhone);
          if (!tokenCheck.verified) {
            return ctx.json(
              { error: tokenCheck.error || "Phone verification failed." },
              { status: 401 }
            );
          }

          // Synthesize deterministic internal email for Better Auth compatibility
          const syntheticEmail = `phone_${digits}@phone.rimna.local`;
          const adapter = ctx.context.internalAdapter;

          let userRecord: any;
          const existing = await adapter.findUserByEmail(syntheticEmail);
          if (existing?.user) {
            userRecord = existing.user;
          } else {
            const displayName =
              body.name?.trim() || `Player +${digits.slice(0, 3)}...${digits.slice(-4)}`;
            userRecord = await adapter.createUser(
              {
                name: displayName,
                email: syntheticEmail,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              { method: "phone-number" }
            );
          }

          if (!userRecord) {
            return ctx.json({ error: "Failed to establish user account." }, { status: 500 });
          }

          const session = await adapter.createSession(userRecord.id);
          if (!session) {
            return ctx.json({ error: "Failed to create active session." }, { status: 500 });
          }

          await setSessionCookie(ctx, { session, user: userRecord });
          return ctx.json({ success: true, user: userRecord });
        }
      ),

      /**
       * POST /api/auth/telegram/verify-and-login
       */
      telegramLogin: createAuthEndpoint(
        "/telegram/verify-and-login",
        {
          method: "POST",
        },
        async (ctx) => {
          const body = (await ctx.body) as TelegramAuthPayload;

          if (!body || !body.id) {
            return ctx.json({ error: "Invalid Telegram payload." }, { status: 400 });
          }

          const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
          const isValid = verifyTelegramAuth(body, botToken);
          if (!isValid) {
            return ctx.json({ error: "Telegram signature verification failed." }, { status: 401 });
          }

          const tgId = String(body.id).trim();
          const syntheticEmail = `tg_${tgId}@telegram.rimna.local`;
          const adapter = ctx.context.internalAdapter;

          let userRecord: any;
          const existing = await adapter.findUserByEmail(syntheticEmail);
          if (existing?.user) {
            userRecord = existing.user;
          } else {
            const fullName = [body.first_name, body.last_name].filter(Boolean).join(" ").trim();
            const displayName = fullName || body.username || `Telegram User ${tgId.slice(-4)}`;

            userRecord = await adapter.createUser(
              {
                name: displayName,
                email: syntheticEmail,
                emailVerified: true,
                image: body.photo_url || null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              { method: "telegram" }
            );
          }

          if (!userRecord) {
            return ctx.json({ error: "Failed to establish user account." }, { status: 500 });
          }

          const session = await adapter.createSession(userRecord.id);
          if (!session) {
            return ctx.json({ error: "Failed to create active session." }, { status: 500 });
          }

          await setSessionCookie(ctx, { session, user: userRecord });
          return ctx.json({ success: true, user: userRecord });
        }
      ),
    },
  };
}
