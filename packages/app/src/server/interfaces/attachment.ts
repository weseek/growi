export const AttachmentType = {
  BRAND_LOGO: 'BRAND_LOGO',
  WIKI_PAGE: 'WIKI_PAGE',
  PROFILE_IMAGE: 'PROFILE_IMAGE',
  undefined,
} as const;

export type AttachmentType = typeof AttachmentType[keyof typeof AttachmentType];
