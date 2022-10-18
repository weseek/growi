// TODO: More methods
export const CalcMethod = {
  SUM: '$$SUM',
} as const;

export type Calc = typeof CalcMethod[keyof typeof CalcMethod];
