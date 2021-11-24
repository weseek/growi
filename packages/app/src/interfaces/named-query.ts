import { IUser } from './user';


export enum SearchResolverName {
  ELASTIC_SEARCH = 'ElasticSearch',
  SEARCH_BOX = 'SearchBox',
  PRIVATE_LEGACY_PAGES = 'PrivateLegacyPages',
}
export interface INamedQuery {
  name: string
  aliasOf?: string
  resolverName?: SearchResolverName
  creator?: IUser
}
