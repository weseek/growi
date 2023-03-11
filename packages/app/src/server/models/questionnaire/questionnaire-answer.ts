import { Document, Model, Schema } from 'mongoose';

import { IQuestionnaireAnswer } from '~/interfaces/questionnaire/questionnaire-answer';
import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { answerSchema } from './schema/answer';
import { growiInfoSchema } from './schema/growi-info';
import { userInfoSchema } from './schema/user-info';

interface QuestionnaireAnswerDocument extends IQuestionnaireAnswer, Document {}

type QuestionnaireAnswerModel = Model<QuestionnaireAnswerDocument>

const questionnaireAnswerSchema = new Schema<QuestionnaireAnswerDocument>({
  answers: [answerSchema],
  answeredAt: { type: Date, required: true },
  growiInfo: { type: growiInfoSchema, required: true },
  userInfo: { type: userInfoSchema, required: true },
}, { timestamps: true });

export default getOrCreateModel<QuestionnaireAnswerDocument, QuestionnaireAnswerModel>('QuestionnaireAnswer', questionnaireAnswerSchema);
