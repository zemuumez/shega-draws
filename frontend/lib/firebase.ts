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
 * Creates and renders a fresh reCAPTCHA verifier for Phone Auth.
 */
export function setupRecaptcha(
  containerId: string,
  onSolved?: () => void
): RecaptchaVerifier | null {
  const auth = getClientFirebaseAuth();
  if (!auth) return null;

  try {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }

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
    throw new Error("Firebase Authentication is not initialized. Please verify configuration.");
  }

  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

/**
 * Translates Firebase error codes into actionable, user-friendly messages.
 */
export function parseFirebasePhoneError(err: any): string {
  const code = err?.code || "";
  const msg = err?.message || "";

  if (code === "auth/internal-error" || msg.includes("auth/internal-error")) {
    return "reCAPTCHA verification was blocked by your browser (e.g. AdBlock, uBlock, or Brave Shield), or Phone Provider is still provisioning in Firebase Console. Please disable AdBlock on localhost or try in an Incognito window.";
  }
  if (code === "auth/invalid-phone-number" || msg.includes("auth/invalid-phone-number")) {
    return "Invalid mobile number format. Please ensure you selected the correct country code and entered a valid phone number.";
  }
  if (code === "auth/too-many-requests" || msg.includes("auth/too-many-requests")) {
    return "Too many SMS requests sent to this number. Please wait a few minutes before trying again.";
  }
  if (code === "auth/quota-exceeded" || msg.includes("auth/quota-exceeded")) {
    return "Daily SMS quota has been exceeded for this Firebase project.";
  }
  if (code === "auth/captcha-check-failed" || msg.includes("auth/captcha-check-failed")) {
    return "Security verification failed. Please disable browser extensions that block Google reCAPTCHA and try again.";
  }
  if (code === "auth/network-request-failed" || msg.includes("auth/network-request-failed")) {
    return "Network connection failed. Please verify your internet connection and try again.";
  }
  if (code === "auth/invalid-verification-code" || msg.includes("auth/invalid-verification-code")) {
    return "The 6-digit SMS code you entered is incorrect. Please check your SMS and try again.";
  }
  if (code === "auth/code-expired" || msg.includes("auth/code-expired")) {
    return "The SMS code has expired. Please click 'Resend Code' to request a new one.";
  }
  if (code === "auth/operation-not-allowed" || msg.includes("auth/operation-not-allowed")) {
    return "Phone Authentication is not enabled in Firebase Console. Go to Authentication > Sign-in method > Phone, and switch it to Enable.";
  }

  return msg || "Failed to process phone verification. Please try again.";
}
