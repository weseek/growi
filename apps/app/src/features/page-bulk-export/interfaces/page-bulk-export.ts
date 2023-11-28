import type {
  IAttachment, IPage, IRevision, IUser, Ref,
} from '@growi/core';

export const PageBulkExportType = {
  markdown: 'markdown',
  pdf: 'pdf',
} as const;

type PageBulkExportType = typeof PageBulkExportType[keyof typeof PageBulkExportType]

export interface IPageBulkExportJob {
  user: Ref<IUser>, // user that started export job
  page: Ref<IPage>, // the root page of page tree to export
  lastUploadedPagePath: string, // the path of page that was uploaded last
  uploadId: string, // upload ID of multipart upload of S3/GCS
  type: PageBulkExportType,
  expireAt: Date, // the date at which job execution expires
}

export interface IPageBulkExportResult {
  attachment: Ref<IAttachment>,
  expireAt: Date, // the date at which downloading of result expires
}

// snapshot of page info to upload
export interface IPageBulkExportPageInfo {
  pageBulkExportJob: Ref<IPageBulkExportJob>,
  path: string, // page path when export was stared
  revision: Ref<IRevision>, // page revision when export was stared
}
