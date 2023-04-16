import { Model, Schema } from 'mongoose';

import { IProactiveQuestionnaireAnswer } from '~/interfaces/questionnaire/proactive-questionnaire-answer';
import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { growiInfoSchema } from './schema/growi-info';
import { userInfoSchema } from './schema/user-info';

interface ProactiveQuestionnaireAnswerDocument extends IProactiveQuestionnaireAnswer, Document {}

type ProactiveQuestionnaireAnswerModel = Model<ProactiveQuestionnaireAnswerDocument>

export const proactiveQuestionnaireAnswerSchema = new Schema<ProactiveQuestionnaireAnswerDocument>({
  satisfaction: { type: Number, required: true },
  lengthOfExperience: { type: String },
  position: { type: String },
  occupation: { type: String },
  commentText: { type: String, required: true },
  growiInfo: { type: growiInfoSchema, required: true },
  userInfo: { type: userInfoSchema, required: true },
  answeredAt: { type: Date },
}, { timestamps: true });

export default getOrCreateModel<ProactiveQuestionnaireAnswerDocument, ProactiveQuestionnaireAnswerModel>(
  'ProactiveQuestionnaireAnswer', proactiveQuestionnaireAnswerSchema,
);
