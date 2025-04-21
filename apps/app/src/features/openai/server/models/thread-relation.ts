import { addDays } from 'date-fns';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import type { IThreadRelation } from '../../interfaces/thread-relation';

const DAYS_UNTIL_EXPIRATION = 3;

const generateExpirationDate = (): Date => {
  return addDays(new Date(), DAYS_UNTIL_EXPIRATION);
};

export interface ThreadRelationDocument extends IThreadRelation, Document {
  updateThreadExpiration(): Promise<void>;
}

interface ThreadRelationModel extends Model<ThreadRelationDocument> {
  getExpiredThreadRelations(limit?: number): Promise<ThreadRelationDocument[] | undefined>;
}

const schema = new Schema<ThreadRelationDocument, ThreadRelationModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  aiAssistant: {
    type: Schema.Types.ObjectId,
    ref: 'AiAssistant',
    required: true,
  },
  threadId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
  },
  expiredAt: {
    type: Date,
    default: generateExpirationDate,
    required: true,
  },
});

schema.statics.getExpiredThreadRelations = async function (limit?: number): Promise<ThreadRelationDocument[] | undefined> {
  const currentDate = new Date();
  const expiredThreadRelations = await this.find({ expiredAt: { $lte: currentDate } })
    .limit(limit ?? 100)
    .exec();
  return expiredThreadRelations;
};

schema.methods.updateThreadExpiration = async function (): Promise<void> {
  this.expiredAt = generateExpirationDate();
  await this.save();
};

export default getOrCreateModel<ThreadRelationDocument, ThreadRelationModel>('ThreadRelation', schema);
