import { Model, Schema, Document } from 'mongoose';

import { IQuestionnaireOrder } from '~/interfaces/questionnaire/questionnaire-order';
import { getOrCreateModel } from '~/server/util/mongoose-utils';

import conditionSchema from './schema/condition';
import questionSchema from './schema/question';

export interface QuestionnaireOrderDocument extends IQuestionnaireOrder, Document {}

export type QuestionnaireOrderModel = Model<QuestionnaireOrderDocument>

const questionnaireOrderTitleSchema = new Schema<IQuestionnaireOrder['title']>({
  ja_JP: { type: String, required: true },
  en_US: { type: String, required: true },
}, { _id: false });

const questionnaireOrderSchema = new Schema<QuestionnaireOrderDocument>({
  shortTitle: { type: questionnaireOrderTitleSchema, required: true },
  title: { type: questionnaireOrderTitleSchema, required: true },
  showFrom: { type: Date, required: true },
  showUntil: {
    type: Date,
    required: true,
    validate: [function(value) {
      return this.showFrom <= value;
    }, 'showFrom must be before showUntil'],
  },
  questions: [questionSchema],
  condition: { type: conditionSchema, required: true },
}, { timestamps: true });

export default getOrCreateModel<QuestionnaireOrderDocument, QuestionnaireOrderModel>('QuestionnaireOrder', questionnaireOrderSchema);
