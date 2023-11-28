import { Document, Model, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { IPageBulkExportJob, PageBulkExportType } from '../../interfaces/page-bulk-export';

export interface PageBulkExportJobDocument extends IPageBulkExportJob, Document {}

export type PageBulkExportJobModel = Model<PageBulkExportJobDocument>

const pageBulkExportJobSchema = new Schema<PageBulkExportJobDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  page: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
  lastUploadedPagePath: { type: String, required: true },
  uploadId: { type: String, required: true },
  type: { type: String, enum: Object.values(PageBulkExportType), required: true },
  expireAt: { type: Date, required: true },
}, { timestamps: true });

export default getOrCreateModel<PageBulkExportJobDocument, PageBulkExportJobModel>('PageBulkExportJob', pageBulkExportJobSchema);
