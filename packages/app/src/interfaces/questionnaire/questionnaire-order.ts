import { HasObjectId } from '@growi/core';

import { ICondition, IConditionHasId } from './condition';
import { IQuestion, IQuestionHasId } from './question';

export interface IQuestionnaireOrder {
  title: {
    ja_JP: string
    en_US: string
  }
  showFrom: Date
  showUntil: Date
  questions: IQuestion[]
  condition: ICondition
}

export type IQuestionnaireOrderHasId = {
  title: {
    ja_JP: string
    en_US: string
  }
  showFrom: Date
  showUntil: Date
  questions: IQuestionHasId[]
  condition: IConditionHasId
} & HasObjectId;
