export const InlineMimeModes = {
  STRICT: 'strict',
  MODERATE: 'moderate',
  LAX: 'lax',
} as const;

export type InlineMimeMode = typeof InlineMimeModes[keyof typeof InlineMimeModes];
