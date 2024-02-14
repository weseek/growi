export const AcceptedUploadFileType = {
  ALL: '*',
  IMAGE: 'image/*',
  NONE: '',
  // ALL: 'all',
  // IMAGE: 'image',
  // NONE: 'none',
} as const;
export type AcceptedUploadFileType = typeof AcceptedUploadFileType[keyof typeof AcceptedUploadFileType];

export const getMimeType = (aufType: AcceptedUploadFileType): string => {
  switch (aufType) {
    case AcceptedUploadFileType.ALL:
      return '*';
    case AcceptedUploadFileType.IMAGE:
      return 'image/*';
    default:
      return '';
  }
};
