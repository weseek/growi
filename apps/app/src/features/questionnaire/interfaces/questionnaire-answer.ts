import type { IGrowiInfo } from '@growi/core/dist/interfaces';

import type { IAnswer } from './answer';
import type { IGrowiAppAdditionalInfo, IGrowiAppInfoLegacy } from './growi-app-info';
import type { IUserInfo } from './user-info';

export interface IQuestionnaireAnswer<ID = string> {
  answers: IAnswer[];
  answeredAt: Date;
  growiInfo: IGrowiInfo<IGrowiAppAdditionalInfo>;
  userInfo: IUserInfo;
  questionnaireOrder: ID;
}

export interface IQuestionnaireAnswerLegacy<ID = string> {
  answers: IAnswer[];
  answeredAt: Date;
  growiInfo: IGrowiAppInfoLegacy;
  userInfo: IUserInfo;
  questionnaireOrder: ID;
}
