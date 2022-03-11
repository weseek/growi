export const PageDeleteConfigValue = {
  Anyone: 'anyone',
  AdminAndAuthor: 'adminAndAuthor',
  AdminOnly: 'adminOnly',
  Inherit: 'inherit',
} as const;
export type PageDeleteConfigValue = typeof PageDeleteConfigValue[keyof typeof PageDeleteConfigValue];
