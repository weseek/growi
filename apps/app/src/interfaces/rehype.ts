export const RehypeSanitizeOption = {
  RECOMMENDED: 'Recommended',
  CUSTOM: 'Custom',
} as const;

export type RehypeSanitizeOption = typeof RehypeSanitizeOption[keyof typeof RehypeSanitizeOption];
