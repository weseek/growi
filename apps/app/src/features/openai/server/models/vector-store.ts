import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export const VectorStoreScopeType = {
  PUBLIC: 'public',
} as const;

export type VectorStoreScopeType = typeof VectorStoreScopeType[keyof typeof VectorStoreScopeType];

const VectorStoreScopeTypes = Object.values(VectorStoreScopeType);
interface VectorStore {
  vectorStoreId: string
  scorpeType: VectorStoreScopeType
}

export interface VectorStoreDocument extends VectorStore, Document {}

type VectorStoreModel = Model<VectorStore>

const schema = new Schema<VectorStoreDocument, VectorStoreModel>({
  vectorStoreId: {
    type: String,
    required: true,
    unique: true,
  },
  scorpeType: {
    enum: VectorStoreScopeTypes,
    type: String,
    required: true,
  },
});

export default getOrCreateModel<VectorStoreDocument, VectorStoreModel>('VectorStore', schema);
