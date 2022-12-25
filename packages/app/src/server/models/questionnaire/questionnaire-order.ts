import { Model, Schema, Document } from 'mongoose';

import { IQuestionnaireOrder } from '~/interfaces/questionnaire/questionnaire-order';
import { getOrCreateModel } from '~/server/util/mongoose-utils';

import conditionSchema from './schema/condition';
import questionSchema from './schema/question';

export interface QuestionnaireOrderDocument extends IQuestionnaireOrder, Document {}

export type QuestionnaireOrderModel = Model<QuestionnaireOrderDocument>

function showDateValidator(value) {
  // `this` is the mongoose document
  return this.showFrom <= value;
}

const questionnaireOrderSchema = new Schema<IQuestionnaireOrder>({
  showFrom: { type: Date, required: true },
  showUntil: { type: Date, required: true, validate: [showDateValidator, 'showFrom must be before showUntil'] },
  questions: [questionSchema],
  condition: { type: conditionSchema, required: true },
}, { timestamps: true });

export default getOrCreateModel<QuestionnaireOrderDocument, QuestionnaireOrderModel>('QuestionnaireOrder', questionnaireOrderSchema);
