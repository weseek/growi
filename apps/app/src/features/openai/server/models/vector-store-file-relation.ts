import type { Types } from 'mongoose';
import type mongoose from 'mongoose';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export interface VectorStoreFileRelation {
  vectorStoreRelationId: mongoose.Types.ObjectId;
  page: mongoose.Types.ObjectId;
  fileIds: string[];
  isAttachedToVectorStore: boolean;
}

interface VectorStoreFileRelationDocument extends VectorStoreFileRelation, Document {}

interface VectorStoreFileRelationModel extends Model<VectorStoreFileRelation> {
  upsertVectorStoreFileRelations(vectorStoreFileRelations: VectorStoreFileRelation[]): Promise<void>;
  markAsAttachedToVectorStore(pageIds: Types.ObjectId[]): Promise<void>;
}

export const prepareVectorStoreFileRelations = (
  vectorStoreRelationId: Types.ObjectId,
  page: Types.ObjectId,
  fileId: string,
  relationsMap: Map<string, VectorStoreFileRelation>,
): Map<string, VectorStoreFileRelation> => {
  const pageIdStr = page.toHexString();
  const existingData = relationsMap.get(pageIdStr);

  // If the data exists, add the fileId to the fileIds array
  if (existingData != null) {
    existingData.fileIds.push(fileId);
  }
  // If the data doesn't exist, create a new one and add it to the map
  else {
    relationsMap.set(pageIdStr, {
      vectorStoreRelationId,
      page,
      fileIds: [fileId],
      isAttachedToVectorStore: false,
    });
  }

  return relationsMap;
};

const schema = new Schema<VectorStoreFileRelationDocument, VectorStoreFileRelationModel>({
  vectorStoreRelationId: {
    type: Schema.Types.ObjectId,
    ref: 'VectorStore',
    required: true,
  },
  page: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
  },
  fileIds: [
    {
      type: String,
      required: true,
    },
  ],
  isAttachedToVectorStore: {
    type: Boolean,
    default: false, // File is not attached to the Vector Store at the time it is uploaded
    required: true,
  },
});

// define unique compound index
schema.index({ vectorStoreRelationId: 1, page: 1 }, { unique: true });

schema.statics.upsertVectorStoreFileRelations = async function (vectorStoreFileRelations: VectorStoreFileRelation[]): Promise<void> {
  await this.bulkWrite(
    vectorStoreFileRelations.map((data) => {
      return {
        updateOne: {
          filter: { page: data.page, vectorStoreRelationId: data.vectorStoreRelationId },
          update: {
            $addToSet: { fileIds: { $each: data.fileIds } },
          },
          upsert: true,
        },
      };
    }),
  );
};

// Used when attached to VectorStore
schema.statics.markAsAttachedToVectorStore = async function (pageIds: Types.ObjectId[]): Promise<void> {
  await this.updateMany({ page: { $in: pageIds } }, { $set: { isAttachedToVectorStore: true } });
};

export default getOrCreateModel<VectorStoreFileRelationDocument, VectorStoreFileRelationModel>('VectorStoreFileRelation', schema);
