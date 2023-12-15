export const AcceptedUploadFileType = {
  ALL: '*',
  IMAGE: 'image/*',
  NONE: '',
} as const;
export type AcceptedUploadFileType = typeof AcceptedUploadFileType[keyof typeof AcceptedUploadFileType];
