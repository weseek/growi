/* eslint-disable camelcase */
import { SearchDelegatorName } from '~/interfaces/named-query';


export type QueryTerms = {
  match: string[],
  not_match: string[],
  phrase: string[],
  not_phrase: string[],
  prefix: string[],
  not_prefix: string[],
  tag: string[],
  not_tag: string[],
}

export type ParsedQuery = {
  queryString: string
  delegatorName: string
}

export interface SearchQueryParser {
  parseSearchQuery(queryString: string): Promise<ParsedQuery>
}

export interface SearchResolver{
  resolve(parsedQuery: ParsedQuery): Promise<[SearchDelegator, SearchableData | null]>
}

export interface SearchDelegator<T = unknown> {
  name?: SearchDelegatorName
  search(data: SearchableData | null, user, userGroups, option): Promise<Result<T> & MetaData>
}

export type Result<T> = {
  data: T
}

export type MetaData = {
  meta: { [key:string]: any }
}

export type SearchableData = {
  queryString: string
  terms: QueryTerms
}
