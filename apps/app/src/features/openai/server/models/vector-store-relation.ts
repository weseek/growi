import type { Types } from 'mongoose';
import type mongoose from 'mongoose';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export interface VectorStoreRelation {
  pageId: mongoose.Types.ObjectId;
  fileIds: string[];
}

interface VectorStoreRelationDocument extends VectorStoreRelation, Document {}

interface VectorStoreRelationModel extends Model<VectorStoreRelation> {
  updateOrCreateDocument(requestData: VectorStoreRelation[]): Promise<void>;
}

export const prepareDocumentData = (pageId: Types.ObjectId, fileId: string, updateArray: VectorStoreRelation[]): VectorStoreRelation[] => {
  const existingData = updateArray.find(relation => relation.pageId.equals(pageId));

  // If the data exists, add the fileId to the fileIds array
  if (existingData != null) {
    existingData.fileIds.push(fileId);
  }
  // If the data doesn't exist, create a new one and add it to the array
  else {
    updateArray.push({
      pageId,
      fileIds: [fileId],
    });
  }

  return updateArray;
};

const schema = new Schema<VectorStoreRelationDocument, VectorStoreRelationModel>({
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

schema.statics.updateOrCreateDocument = async function(requestData: VectorStoreRelation[]): Promise<void> {
  await this.bulkWrite(
    requestData.map((data) => {
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

export default getOrCreateModel<VectorStoreRelationDocument, VectorStoreRelationModel>('VectorStoreRelation', schema);
