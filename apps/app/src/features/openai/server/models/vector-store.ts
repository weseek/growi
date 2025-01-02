import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export const VectorStoreScopeType = {
  PUBLIC: 'public',
} as const;

export type VectorStoreScopeType = typeof VectorStoreScopeType[keyof typeof VectorStoreScopeType];

const VectorStoreScopeTypes = Object.values(VectorStoreScopeType);
export interface VectorStore {
  vectorStoreId: string
  scopeType: VectorStoreScopeType
  isDeleted: boolean
}

export interface VectorStoreDocument extends VectorStore, Document {
  markAsDeleted(): Promise<void>
}

type VectorStoreModel = Model<VectorStore>

const schema = new Schema<VectorStoreDocument, VectorStoreModel>({
  vectorStoreId: {
    type: String,
    required: true,
    unique: true,
  },
  scopeType: {
    enum: VectorStoreScopeTypes,
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true,
  },
});

schema.methods.markAsDeleted = async function(): Promise<void> {
  this.isDeleted = true;
  await this.save();
};

export default getOrCreateModel<VectorStoreDocument, VectorStoreModel>('VectorStore', schema);
