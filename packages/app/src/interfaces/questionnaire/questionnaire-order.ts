import { ICondition } from './questionnaire/condition';
import { IQuestion } from './question';

export interface IQuestionnaireOrder {
  showFrom: Date
  showUntil: Date
  questions: IQuestion[]
  condition: ICondition
}
