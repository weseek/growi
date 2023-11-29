import { type Document, type Model, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { IPageBulkExportPageInfo } from '../../interfaces/page-bulk-export';

export interface PageBulkExportPageInfoDocument extends IPageBulkExportPageInfo, Document {}

export type PageBulkExportPageInfoModel = Model<PageBulkExportPageInfoDocument>

const pageBulkExportPageInfoSchema = new Schema<PageBulkExportPageInfoDocument>({
  pageBulkExportJob: { type: Schema.Types.ObjectId, ref: 'PageBulkExportJob', required: true },
  path: { type: String, required: true },
  revision: { type: Schema.Types.ObjectId, ref: 'Revision', required: true },
}, { timestamps: true });

export default getOrCreateModel<PageBulkExportPageInfoDocument, PageBulkExportPageInfoModel>('PageBulkExportPageInfo', pageBulkExportPageInfoSchema);
