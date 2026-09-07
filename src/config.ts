/**
 * App-wide configuration for PrefixFix.
 *
 * Everything the operators / store owner might want to change lives here or in
 * `src/data/rules.ts` — nothing else needs to be touched on a normal day.
 */

/** Firebase project configuration — fill these in (see README "Firebase setup"). */
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_FIREBASE_APP_ID",
};

/**
 * The Gambia goes 9-digit on 4 September 2026.
 * From 30 November 2026 the old 7-digit format stops working entirely.
 */
export const MIGRATION_DATE = "4 September 2026";
export const OLD_FORMAT_DEADLINE = "30 November 2026";
