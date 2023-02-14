export const SearchTypes = {
  FORWARD: 'forward',
  PARTIAL: 'partial',
  BACKWORD: 'backword',
} as const;

export type SearchType = typeof SearchTypes[keyof typeof SearchTypes];
