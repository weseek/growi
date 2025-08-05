import type { estypes as ES7types, RequestParams } from '@elastic/elasticsearch7';
import type { estypes as ES8types } from '@elastic/elasticsearch8';
import type { estypes as ES9types } from '@elastic/elasticsearch9';

import type { ES7ClientDelegator } from './es7-client-delegator';
import type { ES8ClientDelegator } from './es8-client-delegator';
import type { ES9ClientDelegator } from './es9-client-delegator';

export type ElasticsearchClientDelegator = ES7ClientDelegator | ES8ClientDelegator | ES9ClientDelegator;


// type guard
// TODO: https://redmine.weseek.co.jp/issues/168446
export const isES7ClientDelegator = (delegator: ElasticsearchClientDelegator): delegator is ES7ClientDelegator => {
  return delegator.delegatorVersion === 7;
};

export const isES8ClientDelegator = (delegator: ElasticsearchClientDelegator): delegator is ES8ClientDelegator => {
  return delegator.delegatorVersion === 8;
};

export const isES9ClientDelegator = (delegator: ElasticsearchClientDelegator): delegator is ES9ClientDelegator => {
  return delegator.delegatorVersion === 9;
};


// Official library-derived interface
// TODO: https://redmine.weseek.co.jp/issues/168446
export type ES7SearchQuery = RequestParams.Search<{
    aggregations?: Record<string, ES7types.AggregationsAggregationContainer>
    aggs?: Record<string, ES7types.AggregationsAggregationContainer>
    collapse?: ES7types.SearchFieldCollapse
    explain?: boolean
    from?: ES7types.integer
    highlight?: ES7types.SearchHighlight
    track_total_hits?: ES7types.SearchTrackHits
    indices_boost?: Record<ES7types.IndexName, ES7types.double>[]
    docvalue_fields?: (ES7types.QueryDslFieldAndFormat | ES7types.Field)[]
    min_score?: ES7types.double
    post_filter?: ES7types.QueryDslQueryContainer
    profile?: boolean
    query?: ES7types.QueryDslQueryContainer
    rescore?: ES7types.SearchRescore | ES7types.SearchRescore[]
    script_fields?: Record<string, ES7types.ScriptField>
    search_after?: ES7types.SortResults
    size?: ES7types.integer
    slice?: ES7types.SlicedScroll
    sort?: ES7types.Sort
    _source?: ES7types.SearchSourceConfig
    fields?: (ES7types.QueryDslFieldAndFormat | ES7types.Field)[]
    suggest?: ES7types.SearchSuggester
    terminate_after?: ES7types.long
    timeout?: string
    track_scores?: boolean
    version?: boolean
    seq_no_primary_term?: boolean
    stored_fields?: ES7types.Fields
    pit?: ES7types.SearchPointInTimeReference
    runtime_mappings?: ES7types.MappingRuntimeFields
    stats?: string[]
}>
export interface ES8SearchQuery {
  index: ES8types.IndexName
  _source: ES8types.Fields
  from?: number;
  size?: number;
  body: {
    query: ES8types.QueryDslQueryContainer;
    sort?: ES8types.Sort
    highlight?: ES8types.SearchHighlight;
  };
}

export interface ES9SearchQuery {
  index: ES9types.IndexName
  _source: ES9types.Fields
  from?: number;
  size?: number;
  body: {
    query: ES9types.QueryDslQueryContainer;
    sort?: ES9types.Sort
    highlight?: ES9types.SearchHighlight;
  };
}

export type SearchQuery = ES7SearchQuery | ES8SearchQuery | ES9SearchQuery;
