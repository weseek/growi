/* eslint-disable camelcase */
import { SearchDelegatorName } from '~/interfaces/named-query';
import { ISearchResult } from '~/interfaces/search';


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

export type ParsedQuery = { queryString: string, terms: QueryTerms, delegatorName?: string }

export interface SearchQueryParser {
  parseSearchQuery(queryString: string, nqString: string | null): Promise<ParsedQuery>
}

export interface SearchResolver {
  resolve(parsedQuery: ParsedQuery): Promise<[SearchDelegator, SearchableData | null]>
}

export interface SearchDelegator<T = unknown, KEY extends AllTermsKey = AllTermsKey, QTERMS = unknown> {
  name?: SearchDelegatorName
  search(data: SearchableData | null, user, userGroups, option): Promise<ISearchResult<T>>
  validateTerms(terms: QueryTerms): UnavailableTermsKey<KEY>[],
  excludeUnavailableTerms(terms: QueryTerms): QTERMS,
}

export type SearchableData = {
  queryString: string
  terms: QueryTerms
}

// Terms Key types
export type AllTermsKey = keyof QueryTerms;
export type UnavailableTermsKey<K extends AllTermsKey> = Exclude<AllTermsKey, K>;
export type ESTermsKey = 'match' | 'not_match' | 'phrase' | 'not_phrase' | 'prefix' | 'not_prefix' | 'tag' | 'not_tag';
export type MongoTermsKey = 'match' | 'not_match' | 'prefix' | 'not_prefix';

// Query Terms types
export type ESQueryTerms = Pick<QueryTerms, ESTermsKey>;
export type MongoQueryTerms = Pick<QueryTerms, MongoTermsKey>;
