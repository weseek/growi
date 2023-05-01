import { Schema } from 'mongoose';

import { IQuestion, QuestionType } from '../../../interfaces/question';

const questionTextSchema = new Schema<IQuestion['text']>({
  ja_JP: { type: String, required: true },
  en_US: { type: String, required: true },
}, { _id: false });

const questionSchema = new Schema<IQuestion>({
  type: { type: String, required: true, enum: Object.values(QuestionType) },
  text: { type: questionTextSchema, required: true },
}, { timestamps: true });

export default questionSchema;
