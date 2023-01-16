import { ICondition } from './condition';
import { IQuestion } from './question';

export interface IQuestionnaireOrder {
  showFrom: Date
  showUntil: Date
  questions: IQuestion[]
  condition: ICondition
}
