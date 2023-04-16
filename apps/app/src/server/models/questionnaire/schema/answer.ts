import { Schema } from 'mongoose';

import { IAnswer } from '~/interfaces/questionnaire/answer';
import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

export const answerSchema = new Schema<IAnswer<ObjectIdLike>>({
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  value: { type: String, required: true },
});
