import { IAnswer } from './answer';
import { IGrowiInfo } from './growi-info';
import { IUserInfo } from './user-info';

export interface IQuestionnaireAnswer {
  answers: IAnswer[]
  answeredAt: Date
  growiInfo: IGrowiInfo
  userInfo: IUserInfo
}
