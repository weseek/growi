import { Schema } from 'mongoose';

import { IQuestion, QuestionType } from '~/interfaces/questionnaire/question';

const questionSchema = new Schema<IQuestion>({
  type: { type: String, required: true, enum: Object.values(QuestionType) },
  text: { type: String, required: true },
}, { timestamps: true });

export default questionSchema;
