/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
import { Client as ES7Client, ApiResponse as ES7ApiResponse, RequestParams as ES7RequestParams } from '@elastic/elasticsearch7';
import { Client as ES8Client, estypes } from '@elastic/elasticsearch8';

import {
  BulkResponse,
  CatAliasesResponse,
  CatIndicesResponse,
  IndicesExistsResponse,
  IndicesExistsAliasResponse,
  NodesInfoResponse,
  SearchResponse,
  ValidateQueryResponse,
  ClusterHealthResponse,
  IndicesStatsResponse,
  ReindexResponse,
} from './elasticsearch-client-types';

type ApiResponse<T = any, C = any> = ES7ApiResponse<T, C> | any

export default class ElasticsearchClient {

  client: ES7Client | ES8Client;

  constructor(client: ES7Client | ES8Client) {
    this.client = client;
  }

  bulk(params: ES7RequestParams.Bulk & estypes.BulkRequest): Promise<ApiResponse<BulkResponse>> {
    return this.client instanceof ES7Client ? this.client.bulk(params) : this.client.bulk(params);
  }

  // TODO: cat is not used in current Implementation, remove cat?
  cat = {
    aliases: (params: ES7RequestParams.CatAliases & estypes.CatAliasesRequest): Promise<ApiResponse<CatAliasesResponse>> =>
      this.client instanceof ES7Client ? this.client.cat.aliases(params) : this.client.cat.aliases(params),
    indices: (params: ES7RequestParams.CatIndices & estypes.CatIndicesRequest): Promise<ApiResponse<CatIndicesResponse>> =>
      this.client instanceof ES7Client ? this.client.cat.indices(params) : this.client.cat.indices(params),
  };

  cluster = {
    health: (params: ES7RequestParams.ClusterHealth & estypes.ClusterHealthRequest): Promise<ApiResponse<ClusterHealthResponse>> =>
      this.client instanceof ES7Client ? this.client.cluster.health(params) : this.client.cluster.health(params),
  };

  indices = {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    create: (params: ES7RequestParams.IndicesCreate & estypes.IndicesCreateRequest) =>
      this.client instanceof ES7Client ? this.client.indices.create(params) : this.client.indices.create(params),
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    delete: (params: ES7RequestParams.IndicesDelete & estypes.IndicesDeleteRequest) =>
      this.client instanceof ES7Client ? this.client.indices.delete(params) : this.client.indices.delete(params),
    exists: (params: ES7RequestParams.IndicesExists & estypes.IndicesDeleteRequest): Promise<ApiResponse<IndicesExistsResponse>> =>
      this.client instanceof ES7Client ? this.client.indices.exists(params) : this.client.indices.exists(params),
    existsAlias: (params: ES7RequestParams.IndicesExistsAlias & estypes.IndicesExistsAliasRequest): Promise<ApiResponse<IndicesExistsAliasResponse>> =>
      this.client instanceof ES7Client ? this.client.indices.existsAlias(params) : this.client.indices.existsAlias(params),
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    putAlias: (params: ES7RequestParams.IndicesPutAlias & estypes.IndicesPutAliasRequest) =>
      this.client instanceof ES7Client ? this.client.indices.putAlias(params) : this.client.indices.putAlias(params),
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    getAlias: (params: ES7RequestParams.IndicesGetAlias & estypes.IndicesGetAliasRequest) =>
      this.client instanceof ES7Client ? this.client.indices.getAlias(params) : this.client.indices.getAlias(params),
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    updateAliases: (params: ES7RequestParams.IndicesUpdateAliases & estypes.IndicesUpdateAliasesRequest) =>
      this.client instanceof ES7Client ? this.client.indices.updateAliases(params) : this.client.indices.updateAliases(params),
    validateQuery: (params: ES7RequestParams.IndicesValidateQuery & estypes.IndicesUpdateAliasesRequest): Promise<ApiResponse<ValidateQueryResponse>> =>
      this.client instanceof ES7Client ? this.client.indices.validateQuery(params) : this.client.indices.validateQuery(params),
    stats: (params: ES7RequestParams.IndicesStats & estypes.IndicesStatsRequest): Promise<ApiResponse<IndicesStatsResponse>> =>
      this.client instanceof ES7Client ? this.client.indices.stats(params) : this.client.indices.stats(params),
  };

  nodes = {
    info: (): Promise<ApiResponse<NodesInfoResponse>> => (this.client instanceof ES7Client ? this.client.nodes.info() : this.client.nodes.info()),
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  ping() {
    return this.client instanceof ES7Client ? this.client.ping() : this.client.ping();
  }

  reindex(params: ES7RequestParams.Reindex & estypes.ReindexRequest): Promise<ApiResponse<ReindexResponse>> {
    return this.client instanceof ES7Client ? this.client.reindex(params) : this.client.reindex(params);
  }

  search(params: ES7RequestParams.Search & estypes.SearchRequest): Promise<ApiResponse<SearchResponse>> {
    return this.client instanceof ES7Client ? this.client.search(params) : this.client.search(params);
  }

}
