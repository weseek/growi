import { type Document, type Model, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { IPageBulkExportResult } from '../../interfaces/page-bulk-export';

export interface PageBulkExportResultDocument extends IPageBulkExportResult, Document {}

export type PageBulkExportResultModel = Model<PageBulkExportResultDocument>

const pageBulkExportResultSchema = new Schema<PageBulkExportResultDocument>({
  attachment: { type: Schema.Types.ObjectId, ref: 'Attachment', required: true },
  expireAt: { type: Date, required: true },
}, { timestamps: true });

export default getOrCreateModel<PageBulkExportResultDocument, PageBulkExportResultModel>('PageBulkExportResult', pageBulkExportResultSchema);
