import type mongoose from 'mongoose';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

const DAYS_UNTIL_EXPIRATION = 30;

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
  getThread(userId: string, threadId: string): Promise<Thread | undefined>;
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
  const currentDate = new Date();
  const expirationDate = new Date(currentDate.setDate(currentDate.getDate() + DAYS_UNTIL_EXPIRATION));

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

schema.statics.getThread = async function(userId: string, threadId: string): Promise<Thread | undefined> {
  const result = await this.findOne(
    { userId, 'threads.threadId': threadId },
    { threads: { $elemMatch: { threadId } } },
  );

  if (result != null && result.threads.length > 0) {
    return {
      threadId: result.threads[0].threadId,
      expiredAt: result.threads[0].expiredAt,
    };
  }
};

export default getOrCreateModel<ThreadDocument, ThreadRelationModel>('ThreadRelation', schema);
