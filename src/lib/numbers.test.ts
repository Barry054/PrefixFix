import { describe, expect, it } from "vitest";
import { DEFAULT_RULES } from "../data/rules";
import {
  applyRuleToOriginal,
  matchNumber,
  normalizeNumber,
} from "./numbers";

describe("normalizeNumber", () => {
  it("strips spaces, dashes, dots and parentheses", () => {
    expect(normalizeNumber("+220 501-23.45")).toEqual({
      national: "5012345",
      offset: 3,
    });
  });

  it("strips the +220 country code", () => {
    expect(normalizeNumber("+2205012345")).toEqual({
      national: "5012345",
      offset: 3,
    });
  });

  it("strips the 00220 country code", () => {
    expect(normalizeNumber("002205012345")).toEqual({
      national: "5012345",
      offset: 5,
    });
  });

  it("strips a bare 220 country code only for full 10+ digit numbers", () => {
    expect(normalizeNumber("2205012345")).toEqual({
      national: "5012345",
      offset: 3,
    });

    expect(normalizeNumber("220123")).toEqual({
      national: "220123",
      offset: 0,
    });
  });

  it("strips one leading trunk zero", () => {
    expect(normalizeNumber("05012345")).toEqual({
      national: "5012345",
      offset: 1,
    });
  });

  it("tracks the offset of consumed leading digits", () => {
    expect(normalizeNumber("+220 05012345")).toEqual({
      national: "5012345",
      offset: 4,
    });
  });

  it("returns null for garbage", () => {
    expect(normalizeNumber("not-a-number")).toBeNull();
  });
});

describe("matchNumber with the current Gambia rules", () => {
  it.each([
    ["2123456", "872123456", "Africell", "2"],
    ["3123456", "833123456", "QCell", "3"],
    ["4123456", "874123456", "Africell", "4"],
    ["5123456", "835123456", "QCell", "5"],
    ["6123456", "866123456", "Comium", "6"],
    ["7123456", "877123456", "Africell", "7"],
  ])(
    "migrates %s correctly",
    (input, expected, operator, oldPattern) => {
      const m = matchNumber(input, DEFAULT_RULES)!;

      expect(m.updatedNational).toBe(expected);
      expect(m.rule.operator).toBe(operator);
      expect(m.rule.oldPattern).toBe(oldPattern);
    }
  );

  it("keeps +220 and formatting when rewriting", () => {
    const m = matchNumber("+220 501-2345", DEFAULT_RULES)!;
    expect(m.updated).toBe("+220 83501-2345");
  });

  it("keeps 00220 and formatting when rewriting", () => {
    const m = matchNumber("00220 612-3456", DEFAULT_RULES)!;
    expect(m.updated).toBe("00220 86612-3456");
  });

  it("handles a leading trunk zero", () => {
    const m = matchNumber("07123456", DEFAULT_RULES)!;
    expect(m.updatedNational).toBe("877123456");
    expect(m.updated).toBe("0877123456");
  });

  it("leaves Gamcel/Gamtel numbers starting with 9 untouched", () => {
    expect(matchNumber("9123456", DEFAULT_RULES)).toBeNull();
  });

  it("leaves already-migrated 9-digit numbers untouched", () => {
    expect(matchNumber("835012345", DEFAULT_RULES)).toBeNull();
    expect(matchNumber("866123456", DEFAULT_RULES)).toBeNull();
    expect(matchNumber("877123456", DEFAULT_RULES)).toBeNull();
  });

  it("leaves 9-digit numbers that merely start with a pattern digit untouched", () => {
    expect(matchNumber("512345678", DEFAULT_RULES)).toBeNull();
  });

  it("leaves short numbers untouched", () => {
    expect(matchNumber("501234", DEFAULT_RULES)).toBeNull();
  });

  it("leaves foreign numbers untouched", () => {
    expect(matchNumber("+12025550123", DEFAULT_RULES)).toBeNull();
  });

  it("matches rules most-specific-first", () => {
    const rules = [
      ...DEFAULT_RULES,
      {
        operator: "Test",
        oldPattern: "50",
        transformType: "prefix-prepend" as const,
        newPrefix: "99",
        oldLength: 7,
      },
    ];

    const m = matchNumber("5012345", rules)!;
    expect(m.rule.operator).toBe("Test");
    expect(m.updatedNational).toBe("995012345");
  });

  it("treats an empty newPrefix as a no-op and skips it", () => {
    const rules = [
      {
        operator: "Empty",
        oldPattern: "5",
        transformType: "prefix-prepend" as const,
        newPrefix: "",
        oldLength: 7,
      },
      ...DEFAULT_RULES,
    ];

    const m = matchNumber("5012345", rules)!;
    expect(m.rule.operator).toBe("QCell");
    expect(m.updatedNational).toBe("835012345");
  });

  it("returns null when rules are empty", () => {
    expect(matchNumber("5012345", [])).toBeNull();
  });
});

describe("applyRuleToOriginal", () => {
  it("preserves the original formatting while adding the new prefix", () => {
    const input = "+220 501-2345";
    const normalized = normalizeNumber(input)!;
    const rule = DEFAULT_RULES.find(
      (r) => r.operator === "QCell" && r.oldPattern === "5"
    )!;

    expect(applyRuleToOriginal(input, normalized, rule)).toBe(
      "+220 83501-2345"
    );
  });
});
