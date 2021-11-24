import { SearchDelegatorName } from '~/interfaces/named-query';


export type ParsedQuery = {
  queryString: string // original query string in request
  nqNames: string[] // possible NamedQuery names found in query string
}

export interface SearchQueryParser {
  parseSearchQuery(queryString: string): Promise<ParsedQuery>
}

export interface SearchResolver {
  resolve(parsedQuery: ParsedQuery): Promise<SearchDelegator>
}

export interface SearchDelegator<T = unknown> {
  name: SearchDelegatorName
  search(queryString: string | null, user, userGroups, option): PaginateResult<T> & MetaData
}

export type PaginateResult<T> = {
  limit: number
  offset: number
  data: T
}

export type MetaData = {
  meta: { [key:string]: any }
}
