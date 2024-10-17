import type mongoose from 'mongoose';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

const DAYS_UNTIL_EXPIRATION = 30;

const generateExpirationDate = (): Date => {
  const currentDate = new Date();
  const expirationDate = new Date(currentDate.setDate(currentDate.getDate() + DAYS_UNTIL_EXPIRATION));
  return expirationDate;
};

interface Thread {
  threadId: string;
  expiredAt: Date;
}
interface ThreadRelation {
  userId: mongoose.Types.ObjectId;
  threads: Thread[];
}

interface ThreadDocument extends ThreadRelation, Document {}

interface ThreadRelationModel extends Model<ThreadDocument> {
  upsertThreadRelation(userId: string, threadId: string): Promise<void>;
  getThreadRelationAndUpdateExpiration(userId: string, threadId: string): Promise<ThreadRelation | null>
}

const schema = new Schema<ThreadDocument, ThreadRelationModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  threads: [{
    threadId: {
      type: String,
      required: true,
    },
    expiredAt: {
      type: Date,
      required: true,
    },
  },
  ],
});


schema.statics.upsertThreadRelation = async function(userId: string, threadId: string) {
  const expirationDate = generateExpirationDate();

  await this.updateOne(
    { userId },
    {
      $push: {
        threads: {
          threadId,
          expiredAt: expirationDate,
        },
      },
    },
    { upsert: true },
  );
};


schema.statics.getThreadRelationAndUpdateExpiration = async function(userId: string, threadId: string): Promise<ThreadRelation | null> {
  const expirationDate = generateExpirationDate();

  const result = await this.findOneAndUpdate(
    { userId, 'threads.threadId': threadId },
    { $set: { 'threads.$.expiredAt': expirationDate } }, // Extend DAYS_UNTIL_EXPIRATION days from the retrieved time
    { new: true },
  );

  return result;
};


export default getOrCreateModel<ThreadDocument, ThreadRelationModel>('ThreadRelation', schema);
