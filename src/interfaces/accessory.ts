export const AccessoryName = {
  PAGE_LIST: 'pageList',
  TIME_LINE: 'timeLine',
  PAGE_HISTORY: 'pageHistory',
  ATTACHMENT: 'attachment',
  SHARE_LINK: 'shareLink',
} as const;
export type AccessoryName = typeof AccessoryName[keyof typeof AccessoryName];
