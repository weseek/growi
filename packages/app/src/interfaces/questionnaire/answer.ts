import { Types } from 'mongoose';

export interface IAnswer {
  question: Types.ObjectId | string
  value: string
}
