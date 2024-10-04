import type { Model, Document } from 'mongoose';
import type mongoose from 'mongoose';
import {
  Schema,
} from 'mongoose';

import { getOrCreateModel } from '../util/mongoose-utils';

type VectorStoreRelation = {
  pageId: mongoose.Types.ObjectId;
  fileId: string;
}

interface VectorStoreRelationDocument extends VectorStoreRelation, Document {}

type VectorStoreRelationModel = Model<VectorStoreRelationDocument>

const schema = new Schema<VectorStoreRelationDocument, VectorStoreRelationModel>({
  pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
  fileId: { type: String, required: true },
});

export default getOrCreateModel<VectorStoreRelationDocument, VectorStoreRelationModel>('VectorStoreRelation', schema);
