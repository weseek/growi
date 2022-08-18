export const Lang = {
  en_US: 'en_US',
  ja_JP: 'ja_JP',
  zh_CN: 'zh_CN',
} as const;
export const LangWithMeta = {
  en_US: {
    id: 'en_US',
    displayName: 'English',
    aliases: ['en'],
  },
  ja_JP: {
    id: 'ja_JP',
    displayName: '日本語',
    aliases: ['ja'],
  },
  zh_CN: {
    id: 'zh_CN',
    displayName: '简体中文',
    aliases: ['zh', 'zh-HK', 'zh-CN', 'zh-TW', 'zh-hk', 'zh-cn', 'zh-tw'],
  },
} as const;
export const AllLang = Object.values(Lang);
export type Lang = typeof Lang[keyof typeof Lang];
