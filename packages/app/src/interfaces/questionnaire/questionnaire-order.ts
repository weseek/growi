import { HasObjectId } from '@growi/core';

import { ICondition, IConditionHasId } from './condition';
import { IQuestion, IQuestionHasId } from './question';

export interface IQuestionnaireOrder {
  title: string,
  showFrom: Date
  showUntil: Date
  questions: IQuestion[]
  condition: ICondition
}

export type IQuestionnaireOrderHasId = {
  title: string,
  showFrom: Date
  showUntil: Date
  questions: IQuestionHasId[]
  condition: IConditionHasId
} & HasObjectId;
