import type { IGrowiInfo } from '@growi/core/dist/interfaces';

import type { IGrowiAppAdditionalInfo, IGrowiAppInfoLegacy } from './growi-app-info';
import type { IUserInfo } from './user-info';

export interface IProactiveQuestionnaireAnswer {
  satisfaction: number;
  commentText: string;
  growiInfo: IGrowiInfo<IGrowiAppAdditionalInfo>;
  userInfo: IUserInfo;
  answeredAt: Date;
  lengthOfExperience?: string;
  position?: string;
  occupation?: string;
}

export interface IProactiveQuestionnaireAnswerLegacy {
  satisfaction: number;
  commentText: string;
  growiInfo: IGrowiAppInfoLegacy;
  userInfo: IUserInfo;
  answeredAt: Date;
  lengthOfExperience?: string;
  position?: string;
  occupation?: string;
}
