import type { Attributes } from 'hast-util-sanitize/lib';

export const RehypeSanitizeType = {
  RECOMMENDED: 'Recommended',
  CUSTOM: 'Custom',
} as const;

export type RehypeSanitizeType = typeof RehypeSanitizeType[keyof typeof RehypeSanitizeType];

export type RehypeSanitizeConfiguration = {
  isEnabledXssPrevention: boolean,
  sanitizeType: RehypeSanitizeType,
  customTagWhitelist?: Array<string> | null,
  customAttrWhitelist?: Attributes | null,
}
