/**
 * PrefixFix matching engine.
 *
 * Pure TypeScript with zero device dependencies — everything here can be unit
 * tested in Node. The engine is fully driven by the rules table
 * (`src/data/rules.ts`); it contains no knowledge of specific operators,
 * prefixes or number formats beyond generic national-number normalisation.
 */

export type TransformType = "prefix-prepend" | "prefix-replace";

/** One row of the migration rules table. */
export interface MigrationRule {
  /** Operator name shown in the UI, e.g. "Africell". */
  operator: string;
  /**
   * Digit prefix matched against the start of the *national* number.
   * Identifies which numbers belong to this operator, e.g. "5" matches
   * 5012345 (QCell). Not part of the output for "prefix-prepend".
   */
  oldPattern: string;
  /** How to rewrite the number once `oldPattern` matches. */
  transformType: TransformType;
  /** The digits added to the number: "83" turns 5012345 into 835012345. */
  newPrefix: string;
  /**
   * Optional constraint: the national number must be exactly this many digits.
   * The Gambia migration applies to 7-digit numbers, so rules set 7 here to
   * make sure already-migrated or foreign numbers are never touched.
   */
  oldLength?: number;
}

/** The outcome of running one phone number through the engine. */
export interface NumberChange {
  /** The number exactly as stored in the contact. */
  original: string;
  /** The updated number, original formatting (spaces, dashes, +220…) preserved. */
  updated: string;
  /** National form used for matching (country code stripped). */
  national: string;
  /** New national form after applying the rule. */
  updatedNational: string;
  /** The rule that produced this change. */
  rule: MigrationRule;
}

/** A normalized national number plus how many leading digits were stripped. */
export interface NormalizedNumber {
  national: string;
  /**
   * Number of leading digits consumed from the raw string before the national
   * number begins (country code "220"/"00220" and/or one leading "0"). Used to
   * rewrite the original string without disturbing its formatting.
   */
  offset: number;
}

const DIGIT_RE = /\d/;

/**
 * Normalize a stored phone number into its national form.
 *
 * Strips: whitespace, dashes, dots, slashes, parentheses; a "+" country-code
 * marker; the Gambian country code (00220 / 220 — only stripped when the
 * remaining number would be a plausible national number); and one leading "0"
 * (people often write 0771… for 771…).
 *
 * Returns null for anything that has no digits or contains non-digit garbage.
 */
export function normalizeNumber(input: string): NormalizedNumber | null {
  const cleaned = input.replace(/[\s\-()./]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) return null;

  let digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  let offset = 0;

  // International format with the Gambian country code.
  if (digits.startsWith("00220")) {
    digits = digits.slice(5);
    offset += 5;
  } else if (digits.startsWith("220") && digits.length >= 10) {
    // Only treat a bare "220" as the country code when the rest is a full
    // 7-digit national number — never strip it from a short stored number.
    digits = digits.slice(3);
    offset += 3;
  }

  // One leading trunk-style zero.
  if (digits.startsWith("0") && digits.length > 1) {
    digits = digits.slice(1);
    offset += 1;
  }

  if (digits.length === 0) return null;
  return { national: digits, offset };
}

/** Apply a rule's transform to a national number, returning the new national form. */
function applyTransform(national: string, rule: MigrationRule): string {
  switch (rule.transformType) {
    case "prefix-prepend":
      return rule.newPrefix + national;
    case "prefix-replace":
      return rule.newPrefix + national.slice(rule.oldPattern.length);
  }
}

/**
 * Rewrite the original stored string with a rule applied, keeping every
 * non-digit character (spaces, dashes, "+220"…) exactly where it was.
 *
 * Digits before the national number (the country code / leading zero) are kept
 * as-is; the transform is then applied at the first national digit and every
 * following digit is preserved verbatim.
 */
export function applyRuleToOriginal(
  original: string,
  normalized: NormalizedNumber,
  rule: MigrationRule
): string {
  const oldLen = rule.oldPattern.length;
  let digitsSeen = 0;
  let inserted = false;
  let out = "";

  for (const ch of original) {
    if (!DIGIT_RE.test(ch)) {
      out += ch;
      continue;
    }
    // Insert the new prefix right before the first national digit.
    if (digitsSeen === normalized.offset && !inserted) {
      out += rule.newPrefix;
      inserted = true;
    }
    if (digitsSeen < normalized.offset) {
      out += ch; // country code / leading zero region
    } else if (rule.transformType === "prefix-prepend") {
      out += ch; // prepend keeps every original digit
    } else if (digitsSeen - normalized.offset >= oldLen) {
      out += ch; // prefix-replace: keep the tail after the consumed pattern
    }
    digitsSeen++;
  }
  return out;
}

/**
 * Run one phone number through the rules table.
 *
 * Rules are considered most-specific-first (longest `oldPattern` wins), so a
 * rule for "50" beats a rule for "5" if both were ever defined. The first rule
 * that matches returns; numbers that match nothing (or that a rule would leave
 * unchanged) return null and are left untouched.
 */
export function matchNumber(input: string, rules: MigrationRule[]): NumberChange | null {
  const normalized = normalizeNumber(input);
  if (!normalized) return null;

  const sorted = [...rules].sort((a, b) => b.oldPattern.length - a.oldPattern.length);

  for (const rule of sorted) {
    if (!normalized.national.startsWith(rule.oldPattern)) continue;
    if (rule.oldLength !== undefined && normalized.national.length !== rule.oldLength) continue;

    const updatedNational = applyTransform(normalized.national, rule);
    if (updatedNational === normalized.national) continue; // no-op rule

    return {
      original: input,
      updated: applyRuleToOriginal(input, normalized, rule),
      national: normalized.national,
      updatedNational,
      rule,
    };
  }
  return null;
}