export const Locale = {
  'en-US': 'en-US',
  'ja-JP': 'ja-JP',
  'zh-CN': 'zh-CN',
  'fr-FR': 'fr-FR',
} as const;
export const AllLocale = Object.values(Locale);
export type Locale = typeof Locale[keyof typeof Locale];
