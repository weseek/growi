import { IGrowiInfo } from './growi-info';
import { IUserInfo } from './user-info';

export interface IProactiveQuestionnaireAnswer {
  satisfaction: number,
  commentText: string,
  growiInfo: IGrowiInfo,
  userInfo: IUserInfo,
  answeredAt: Date,
  lengthOfExperience?: string,
  position?: string,
  occupation?: string,
}
