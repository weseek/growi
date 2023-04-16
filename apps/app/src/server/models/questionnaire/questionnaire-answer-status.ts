import { Model, Schema, Document } from 'mongoose';

import { IQuestionnaireAnswerStatus, StatusType } from '~/interfaces/questionnaire/questionnaire-answer-status';
import { getOrCreateModel } from '~/server/util/mongoose-utils';

export interface QuestionnaireAnswerStatusDocument extends IQuestionnaireAnswerStatus, Document {}

export type QuestionnaireAnswerStatusModel = Model<QuestionnaireAnswerStatusDocument>

const questionnaireOrderSchema = new Schema<QuestionnaireAnswerStatusDocument>({
  user: { type: Schema.Types.ObjectId, required: true },
  questionnaireOrderId: { type: String, required: true },
  status: { type: String, enum: Object.values(StatusType), default: StatusType.not_answered },
}, { timestamps: true });

export default getOrCreateModel<QuestionnaireAnswerStatusDocument, QuestionnaireAnswerStatusModel>('QuestionnaireAnswerStatus', questionnaireOrderSchema);
