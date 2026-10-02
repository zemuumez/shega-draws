import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from "firebase/auth";

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;

export function isFirebaseConfigured(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return Boolean(
    apiKey &&
      apiKey.trim() !== "" &&
      !apiKey.includes("placeholder") &&
      projectId &&
      projectId.trim() !== ""
  );
}

export function getClientFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!firebaseApp) {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
    }
  }

  return firebaseApp;
}

export function getClientFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  const app = getClientFirebaseApp();
  if (!app) return null;

  if (!firebaseAuth) {
    firebaseAuth = getAuth(app);
  }
  return firebaseAuth;
}

/**
 * Creates and renders a reCAPTCHA verifier for Phone Auth.
 */
export function setupRecaptcha(
  containerId: string,
  onSolved?: () => void
): RecaptchaVerifier | null {
  const auth = getClientFirebaseAuth();
  if (!auth) return null;

  try {
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        if (onSolved) onSolved();
      },
      "expired-callback": () => {
        console.warn("reCAPTCHA expired, user may need to re-verify.");
      },
    });

    return verifier;
  } catch (err) {
    console.error("Failed to setup RecaptchaVerifier:", err);
    return null;
  }
}

/**
 * Sends SMS verification code via Firebase.
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const auth = getClientFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase Authentication is not initialized or configured.");
  }

  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}
