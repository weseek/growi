import { ICondition } from './condition';
import { IQuestion } from './question';

export interface IQuestionnaireOrder {
  orderId: string // growi-questionnaire での mongoDB の id
  showFrom: Date
  showUntil: Date
  questions: IQuestion[]
  condition: ICondition
}
