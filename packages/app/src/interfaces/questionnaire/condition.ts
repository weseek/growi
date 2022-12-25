import { GrowiServiceType } from './growi-info';
import { UserType } from './user-info';

interface UserCondition {
  types: UserType[] // アンケート対象ユーザータイプ
}

interface GrowiCondition {
  types: GrowiServiceType[] // アンケート対象 GROWI タイプ
  versionRegExps: string[] // アンケート対象 GROWI バージョン正規表現
}

export interface ICondition {
  user: UserCondition
  growi: GrowiCondition
}
