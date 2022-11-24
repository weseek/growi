export const RehypeSanitizeOption = {
  RECOMMENDED: 1,
  CUSTOM: 2,
} as const;

export type RehypeSanitizeOption = typeof RehypeSanitizeOption[keyof typeof RehypeSanitizeOption];

export type RehypeSanitizeOptionConfig = {
  isEnabledXssPrevention: boolean,
  tagNames: any[],
  attributes: { [key: string]: any },
}
