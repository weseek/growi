import { Types } from 'mongoose';

export const StatusType = {
  not_answered: 'not_answered', answered: 'answered', skipped: 'skipped', denied: 'denied',
} as const;

export type StatusType = typeof StatusType[keyof typeof StatusType];

export interface IQuestionnaireAnswerStatus {
  user: Types.ObjectId | string // user that answered questionnaire
  questionnaireOrderId: string
  status: StatusType
}
