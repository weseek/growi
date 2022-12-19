export const RehypeSanitizeOption = {
  RECOMMENDED: 'Recommended',
  CUSTOM: 'Custom',
} as const;

export type RehypeSanitizeOption = typeof RehypeSanitizeOption[keyof typeof RehypeSanitizeOption];

export type RehypeSanitizeOptionConfig = {
  isEnabledXssPrevention: boolean,
  // Todo add types for custom sanitize option at https://redmine.weseek.co.jp/issues/109763
}
