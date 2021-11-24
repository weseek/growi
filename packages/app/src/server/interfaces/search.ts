import { SearchDelegatorName } from '~/interfaces/named-query';


export type ParsedQuery = {
  originalString: string
  nqNames: string[]
}

export interface SearchQueryParser {
  parseSearchQuery(queryString): Promise<ParsedQuery>
}

export interface SearchResolver {
  resolve(parsedQuery: ParsedQuery): SearchDelegator
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
