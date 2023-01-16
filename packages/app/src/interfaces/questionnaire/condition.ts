import { GrowiServiceType } from './growi-info';
import { UserType } from './user-info';

interface UserCondition {
  types: UserType[] // user types to show questionnaire
}

interface GrowiCondition {
  types: GrowiServiceType[] // GROWI types to show questionnaire in
  versionRegExps: string[] // GROWI versions to show questionnaire in
}

export interface ICondition {
  user: UserCondition
  growi: GrowiCondition
}
