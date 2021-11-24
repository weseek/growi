import { IUser } from './user';


export enum SearchResolverName {
  DEFAULT = 'FullTextSearch',
  PRIVATE_LEGACY_PAGES = 'PrivateLegacyPages',
}
export interface INamedQuery {
  name: string
  aliasOf?: string
  resolverName?: SearchResolverName
  creator?: IUser
}
