export const AcceptedUploadFileType = {
  ALL: '*',
  IMAGE: 'image/*',
  NO: null,
} as const;
export type AcceptedUploadFileType = typeof AcceptedUploadFileType[keyof typeof AcceptedUploadFileType];
