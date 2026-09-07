import type { MigrationRule } from "../lib/numbers";

export const DEFAULT_RULES: MigrationRule[] = [
  // Africell: 2, 4, 7 → add 87
  { operator: "Africell", oldPattern: "2", transformType: "prefix-prepend", newPrefix: "87", oldLength: 7 },
  { operator: "Africell", oldPattern: "4", transformType: "prefix-prepend", newPrefix: "87", oldLength: 7 },
  { operator: "Africell", oldPattern: "7", transformType: "prefix-prepend", newPrefix: "87", oldLength: 7 },

  // QCell: 3, 5 → add 83
  { operator: "QCell", oldPattern: "3", transformType: "prefix-prepend", newPrefix: "83", oldLength: 7 },
  { operator: "QCell", oldPattern: "5", transformType: "prefix-prepend", newPrefix: "83", oldLength: 7 },

  // Comium: 6 → add 86
  { operator: "Comium", oldPattern: "6", transformType: "prefix-prepend", newPrefix: "86", oldLength: 7 },
];
