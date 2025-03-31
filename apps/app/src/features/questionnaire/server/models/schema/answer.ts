import { Schema } from 'mongoose';

import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import type { IAnswer } from '../../../interfaces/answer';

export const answerSchema = new Schema<IAnswer<ObjectIdLike>>({
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  value: { type: String, required: true },
});
