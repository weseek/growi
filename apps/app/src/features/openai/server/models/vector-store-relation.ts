import type { HydratedDocument, Types } from 'mongoose';
import type mongoose from 'mongoose';
import { type Model, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export type VectorStoreRelation = {
  pageId: mongoose.Types.ObjectId;
  fileIds: string[];
}

export const prepareDocumentData = (pageId: Types.ObjectId, fileId: string, updateArray: VectorStoreRelation[]): VectorStoreRelation[] => {
  const existingData = updateArray.find(relation => relation.pageId.equals(pageId));

  if (existingData != null) {
    // If the data exists, add the fileId to the fileIds array
    existingData.fileIds.push(fileId);
  }
  else {
    // If the data doesn't exist, create a new one and add it to the array
    updateArray.push({
      pageId,
      fileIds: [fileId],
    });
  }

  return updateArray;
};

type VectorStoreRelationDocument = HydratedDocument<VectorStoreRelation>;

type VectorStoreRelationModel = Model<VectorStoreRelation, undefined, undefined, undefined, VectorStoreRelationDocument> & {
  updateOrCreateDocument(requestData: VectorStoreRelation[]): Promise<void>;
}

const schema = new Schema<VectorStoreRelation, VectorStoreRelationModel>({
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
