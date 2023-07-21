import type { HasObjectId } from '@growi/core';

import { ICondition, IConditionHasId } from './condition';
import { IQuestion, IQuestionHasId } from './question';

export interface IQuestionnaireOrder<TQUESTION = IQuestion, TCONDITION = ICondition> {
  shortTitle: {
    ja_JP: string
    en_US: string
  }
  title: {
    ja_JP: string
    en_US: string
  }
  showFrom: Date
  showUntil: Date
  questions: TQUESTION[]
  condition: TCONDITION
}

export type IQuestionnaireOrderHasId = IQuestionnaireOrder<IQuestionHasId, IConditionHasId> & HasObjectId;
