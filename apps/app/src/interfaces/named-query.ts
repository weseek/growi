import type { IUser } from '@growi/core/dist/interfaces';


export enum SearchDelegatorName {
  DEFAULT = 'FullTextSearch',
  PRIVATE_LEGACY_PAGES = 'PrivateLegacyPages',
}
export interface INamedQuery {
  name: string
  aliasOf?: string
  delegatorName?: SearchDelegatorName
  creator?: IUser
}
