export const RehypeSanitizeOption = {
  RECOMMENDED: 1,
  CUSTOM: 2,
} as const;

export type RehypeSanitizeOption = typeof RehypeSanitizeOption[keyof typeof RehypeSanitizeOption];
