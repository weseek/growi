export const PageDeleteConfigValue = {
  Anyone: 'anyOne', // must be "anyOne" (not "anyone") for backward compatibility
  AdminAndAuthor: 'adminAndAuthor',
  AdminOnly: 'adminOnly',
  Inherit: 'inherit',
} as const;
export type PageDeleteConfigValue = typeof PageDeleteConfigValue[keyof typeof PageDeleteConfigValue];

export type PageDeleteConfigValueToProcessValidation =
  Exclude<PageDeleteConfigValue, typeof PageDeleteConfigValue.Inherit>;
export type PageRecursiveDeleteConfigValueToProcessValidation =
  Exclude<PageDeleteConfigValue, typeof PageDeleteConfigValue.Inherit | typeof PageDeleteConfigValue.Anyone>;

export const PageSingleDeleteConfigValue = {
  Anyone: 'anyOne', // must be "anyOne" (not "anyone") for backward compatibility
  AdminAndAuthor: 'adminAndAuthor',
  AdminOnly: 'adminOnly',
} as const;
export type PageSingleDeleteConfigValue = Exclude<PageDeleteConfigValue, typeof PageDeleteConfigValue.Inherit>;

export const PageSingleDeleteCompConfigValue = {
  Anyone: 'anyOne', // must be "anyOne" (not "anyone") for backward compatibility
  AdminAndAuthor: 'adminAndAuthor',
  AdminOnly: 'adminOnly',
} as const;
export type PageSingleDeleteCompConfigValue = Exclude<PageDeleteConfigValue, typeof PageDeleteConfigValue.Inherit>;

export const PageRecursiveDeleteConfigValue = {
  AdminAndAuthor: 'adminAndAuthor',
  AdminOnly: 'adminOnly',
  Inherit: 'inherit',
} as const;
export type PageRecursiveDeleteConfigValue = Exclude<PageDeleteConfigValue, typeof PageDeleteConfigValue.Anyone>;

export const PageRecursiveDeleteCompConfigValue = {
  AdminAndAuthor: 'adminAndAuthor',
  AdminOnly: 'adminOnly',
  Inherit: 'inherit',
} as const;
export type PageRecursiveDeleteCompConfigValue = Exclude<PageDeleteConfigValue, typeof PageDeleteConfigValue.Anyone>;
