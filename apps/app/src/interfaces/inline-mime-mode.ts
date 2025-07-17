export const InlineMimeModes = {
  STRICT: 'strict',
  MODERATE: 'moderate',
  LAX: 'lax',
  MANUAL: 'manual',
} as const;

export type InlineMimeMode = typeof InlineMimeModes[keyof typeof InlineMimeModes];
