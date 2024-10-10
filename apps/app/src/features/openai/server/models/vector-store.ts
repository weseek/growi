import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';


export const VectorStoreScopeType = {
  PUBLIC: 'public',
  GROUP: 'group',
} as const;

export type VectorStoreScopeType = typeof VectorStoreScopeType[keyof typeof VectorStoreScopeType];

const VectorStoreScopeTypes = Object.values(VectorStoreScopeType);

interface VectorStore {
  vectorStoreId: string
  scorpeType: VectorStoreScopeType
}

interface VectorStoreDocument extends VectorStore, Document {}

interface VectorStoreModel extends Model<VectorStore> {
  getPublicVectorStore(): Promise<VectorStoreDocument | null>;
}

const schema = new Schema<VectorStoreDocument, VectorStoreModel>({
  vectorStoreId: {
    type: String,
    required: true,
    unique: true,
  },
  scorpeType: {
    enum: VectorStoreScopeTypes,
    default: VectorStoreScopeType.PUBLIC,
    type: String,
    required: true,
  },
});

export default getOrCreateModel<VectorStoreDocument, VectorStoreModel>('VectorStore', schema);
