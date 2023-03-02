import { HasObjectId } from '@growi/core';

import { GrowiServiceType } from './growi-info';
import { UserType } from './user-info';

interface UserCondition {
  types: UserType[] // user types to show questionnaire
  daysSinceCreation?: {
    moreThanOrEqualTo?: number
    lessThanOrEqualTo?: number
  }
}

interface GrowiCondition {
  types: GrowiServiceType[] // GROWI types to show questionnaire in
  versionRegExps: string[] // GROWI versions to show questionnaire in
}

export interface ICondition {
  user: UserCondition
  growi: GrowiCondition
}

export type IConditionHasId = ICondition & HasObjectId;
