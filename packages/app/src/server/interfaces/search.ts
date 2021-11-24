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

export interface SearchDelegator<T> {
  name: DelegatorName
  search(queryString: string | null, user, userGroups, option): PaginateResult<T> & MetaData
}

type PaginateResult<T> = {
  limit: number
  offset: number
  data: T
}

type MetaData = {
  meta: { [key:string]: any }
}
