import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  signInAnonymously,
  type Auth,
} from "firebase/auth";
import { getFunctions, type Functions } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_CONFIG } from "../config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;

function isConfigured(): boolean {
  return !FIREBASE_CONFIG.apiKey.startsWith("YOUR_");
}

/**
 * Initialize Firebase (once) and make sure we have an anonymous identity.
 *
 * The anonymous uid provides a lightweight app identity for Firebase services
 * and is persisted with AsyncStorage so it survives app restarts.
 */
export async function ensureFirebase(): Promise<void> {
  if (!isConfigured()) {
    throw new Error(
      "Firebase is not configured. Open src/config.ts and add your Firebase project details (see README)."
    );
  }
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG);
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    functions = getFunctions(app);
  } else {
    auth = getAuth(app);
    functions = getFunctions(app);
  }
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

/** Throws if Firebase has not been initialized via ensureFirebase(). */
export function getFunctionsInstance(): Functions {
  if (!functions) throw new Error("Firebase has not been initialized yet.");
  return functions;
}
