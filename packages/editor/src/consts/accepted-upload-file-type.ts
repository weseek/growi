export const AcceptedUploadFileType = {
  ALL: '*',
  IMAGE: 'image/*',
  NONE: null,
} as const;
export type AcceptedUploadFileType = typeof AcceptedUploadFileType[keyof typeof AcceptedUploadFileType];
