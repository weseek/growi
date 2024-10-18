import type { Types } from 'mongoose';
import type mongoose from 'mongoose';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export interface VectorStoreFileRelation {
  pageId: mongoose.Types.ObjectId;
  fileIds: string[];
}

interface VectorStoreFileRelationDocument extends VectorStoreFileRelation, Document {}

interface VectorStoreFileRelationModel extends Model<VectorStoreFileRelation> {
  upsertVectorStoreFileRelations(vectorStoreFileRelations: VectorStoreFileRelation[]): Promise<void>;
}

export const prepareVectorStoreFileRelations = (
    pageId: Types.ObjectId, fileId: string, relationsMap: Map<string, VectorStoreFileRelation>,
): Map<string, VectorStoreFileRelation> => {
  const pageIdStr = pageId.toHexString();
  const existingData = relationsMap.get(pageIdStr);

  // If the data exists, add the fileId to the fileIds array
  if (existingData != null) {
    existingData.fileIds.push(fileId);
  }
  // If the data doesn't exist, create a new one and add it to the map
  else {
    relationsMap.set(pageIdStr, {
      pageId,
      fileIds: [fileId],
    });
  }

  return relationsMap;
};

const schema = new Schema<VectorStoreFileRelationDocument, VectorStoreFileRelationModel>({
  pageId: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
    unique: true,
  },
  fileIds: [{
    type: String,
    required: true,
  }],
});

schema.statics.upsertVectorStoreFileRelations = async function(vectorStoreFileRelations: VectorStoreFileRelation[]): Promise<void> {
  await this.bulkWrite(
    vectorStoreFileRelations.map((data) => {
      return {
        updateOne: {
          filter: { pageId: data.pageId },
          update: { $addToSet: { fileIds: { $each: data.fileIds } } },
          upsert: true,
        },
      };
    }),
  );
};

export default getOrCreateModel<VectorStoreFileRelationDocument, VectorStoreFileRelationModel>('VectorStoreFileRelation', schema);
