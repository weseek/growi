// eslint-disable-next-line max-len
// see: https://dev.growi.org/6385911e1632aa30f4dae6a4#mdcont-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%81%94%E3%81%A8%E3%81%AB%E5%9B%9E%E7%AD%94%E6%B8%88%E3%81%BF%E3%81%8B%E3%81%A9%E3%81%86%E3%81%8B%E3%82%92%E4%BF%9D%E5%AD%98%E3%81%99%E3%82%8B

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
