/** Minimal design tokens — Gambia-flag inspired, one-time utility vibes. */
export const colors = {
  bg: "#F5F8F5",
  surface: "#FFFFFF",
  primary: "#0B7A3B", // Gambia green
  primaryDark: "#085E2E",
  primarySoft: "#E3F2E8",
  accent: "#0C1C8C", // Gambia blue
  red: "#CE1126", // Gambia red
  text: "#15241B",
  muted: "#5C6B61",
  border: "#E1E8E1",
  danger: "#B91C1C",
  success: "#0B7A3B",
  warning: "#B45309",
};

/** Operator colours used for the badges in the preview list. */
export const operatorColors: Record<string, string> = {
  QCell: "#0B7A3B",
  Africell: "#CE1126",
  Comium: "#0C1C8C",
  Gamcel: "#B45309",
  Gamtel: "#B45309",
};

export function operatorColor(operator: string): string {
  return operatorColors[operator] ?? "#475569";
}