export const RehypeSanitizeOption = {
  Recommended: 1,
  Custom: 2,
} as const;

export type RehypeSanitizeOption = typeof RehypeSanitizeOption[keyof typeof RehypeSanitizeOption];
