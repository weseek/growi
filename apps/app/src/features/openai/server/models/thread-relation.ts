import type mongoose from 'mongoose';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

const DAYS_UNTIL_EXPIRATION = 30;

const generateExpirationDate = (): Date => {
  const currentDate = new Date();
  const expirationDate = new Date(currentDate.setDate(currentDate.getDate() + DAYS_UNTIL_EXPIRATION));
  return expirationDate;
};


/*
*  Thread Model
*/
interface Thread {
  threadId: string;
  expiredAt: Date;
}

interface ThreadDocument extends Thread, Document {
  updateExpiration(): Promise<void>;
}

type ThreadModel = Model<ThreadDocument>

const threadSchema = new Schema<Thread, ThreadDocument, ThreadModel>({
  threadId: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
});

threadSchema.methods.updateExpiration = async function(): Promise<void> {
  this.expiredAt = generateExpirationDate();
  this.parent().save();
};


/*
*  Thread Relation Model
*/
interface ThreadRelation {
  userId: mongoose.Types.ObjectId;
  threads: ThreadDocument[];
}
interface ThreadRelationDocument extends ThreadRelation, Document {
  updateExpiration(threadId: string): Promise<void>;
}

interface ThreadRelationModel extends Model<ThreadRelationDocument> {
  upsertThreadRelation(userId: string, threadId: string): Promise<void>;
  getThreadRelation(userId: string, threadId: string): Promise<ThreadRelationDocument | null>
}

const threadRelationSchema = new Schema<ThreadRelationDocument, ThreadRelationModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  threads: [threadSchema],
});


threadRelationSchema.statics.upsertThreadRelation = async function(userId: string, threadId: string) {
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


threadRelationSchema.statics.getThreadRelation = async function(userId: string, threadId: string): Promise<ThreadRelationDocument | null> {
  const result = await this.findOne({ userId, 'threads.threadId': threadId });
  return result;
};

export default getOrCreateModel<ThreadRelationDocument, ThreadRelationModel>('ThreadRelation', threadRelationSchema);
