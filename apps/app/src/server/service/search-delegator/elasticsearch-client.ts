/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
import { Client as ES7Client, ApiResponse as ES7ApiResponse, RequestParams as ES7RequestParams } from '@elastic/elasticsearch7';

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

// type ApiResponse<T = any, C = any> = ES6ApiResponse<T, C> | ES7ApiResponse<T, C>

// export default class ElasticsearchClient {

//   client: ES6Client | ES7Client;

//   constructor(client: ES6Client | ES7Client) {
//     this.client = client;
//   }

//   bulk(params: ES6RequestParams.Bulk & ES7RequestParams.Bulk): Promise<ApiResponse<BulkResponse>> {
//     return this.client instanceof ES6Client ? this.client.bulk(params) : this.client.bulk(params);
//   }

//   // TODO: cat is not used in current Implementation, remove cat?
//   cat = {
//     aliases: (params: ES6RequestParams.CatAliases & ES7RequestParams.CatAliases): Promise<ApiResponse<CatAliasesResponse>> =>
//       this.client instanceof ES6Client ? this.client.cat.aliases(params) : this.client.cat.aliases(params),
//     indices: (params: ES6RequestParams.CatIndices & ES7RequestParams.CatIndices): Promise<ApiResponse<CatIndicesResponse>> =>
//       this.client instanceof ES6Client ? this.client.cat.indices(params) : this.client.cat.indices(params),
//   };

//   cluster = {
//     health: (params: ES6RequestParams.ClusterHealth & ES7RequestParams.ClusterHealth): Promise<ApiResponse<ClusterHealthResponse>> =>
//       this.client instanceof ES6Client ? this.client.cluster.health(params) : this.client.cluster.health(params),
//   };

//   indices = {
//     create: (params: ES6RequestParams.IndicesCreate & ES7RequestParams.IndicesCreate) =>
//       this.client instanceof ES6Client ? this.client.indices.create(params) : this.client.indices.create(params),
//     delete: (params: ES6RequestParams.IndicesDelete & ES7RequestParams.IndicesDelete) =>
//       this.client instanceof ES6Client ? this.client.indices.delete(params) : this.client.indices.delete(params),
//     exists: (params: ES6RequestParams.IndicesExists & ES7RequestParams.IndicesExists): Promise<ApiResponse<IndicesExistsResponse>> =>
//       this.client instanceof ES6Client ? this.client.indices.exists(params) : this.client.indices.exists(params),
//     existsAlias: (params: ES6RequestParams.IndicesExistsAlias & ES7RequestParams.IndicesExistsAlias): Promise<ApiResponse<IndicesExistsAliasResponse>> =>
//       this.client instanceof ES6Client ? this.client.indices.existsAlias(params) : this.client.indices.existsAlias(params),
//     putAlias: (params: ES6RequestParams.IndicesPutAlias & ES7RequestParams.IndicesPutAlias) =>
//       this.client instanceof ES6Client ? this.client.indices.putAlias(params) : this.client.indices.putAlias(params),
//     getAlias: (params: ES6RequestParams.IndicesGetAlias & ES7RequestParams.IndicesGetAlias) =>
//       this.client instanceof ES6Client ? this.client.indices.getAlias(params) : this.client.indices.getAlias(params),
//     updateAliases: (params: ES6RequestParams.IndicesUpdateAliases & ES7RequestParams.IndicesUpdateAliases) =>
//       this.client instanceof ES6Client ? this.client.indices.updateAliases(params) : this.client.indices.updateAliases(params),
//     validateQuery: (params: ES6RequestParams.IndicesValidateQuery & ES7RequestParams.IndicesValidateQuery): Promise<ApiResponse<ValidateQueryResponse>> =>
//       this.client instanceof ES6Client ? this.client.indices.validateQuery(params) : this.client.indices.validateQuery(params),
//     stats: (params: ES6RequestParams.IndicesStats & ES7RequestParams.IndicesStats): Promise<ApiResponse<IndicesStatsResponse>> =>
//       this.client instanceof ES6Client ? this.client.indices.stats(params) : this.client.indices.stats(params),
//   };

//   nodes = {
//     info: (): Promise<ApiResponse<NodesInfoResponse>> => (this.client instanceof ES6Client ? this.client.nodes.info() : this.client.nodes.info()),
//   };

//   ping() {
//     return this.client instanceof ES6Client ? this.client.ping() : this.client.ping();
//   }

//   reindex(params: ES6RequestParams.Reindex & ES7RequestParams.Reindex): Promise<ApiResponse<ReindexResponse>> {
//     return this.client instanceof ES6Client ? this.client.reindex(params) : this.client.reindex(params);
//   }

//   search(params: ES6RequestParams.Search & ES7RequestParams.Search): Promise<ApiResponse<SearchResponse>> {
//     return this.client instanceof ES6Client ? this.client.search(params) : this.client.search(params);
//   }

// }


type ApiResponse<T = any, C = any> = ES7ApiResponse<T, C>
export default class ElasticsearchClient {

  client: ES7Client;

  constructor(client: ES7Client) {
    this.client = client;
  }

  bulk(params: ES7RequestParams.Bulk): Promise<ApiResponse<BulkResponse>> {
    return this.client.bulk(params);
  }

  // TODO: cat is not used in current Implementation, remove cat?
  cat = {
    aliases: (params: ES7RequestParams.CatAliases): Promise<ApiResponse<CatAliasesResponse>> =>
      this.client.cat.aliases(params),
    indices: (params: ES7RequestParams.CatIndices): Promise<ApiResponse<CatIndicesResponse>> =>
      this.client.cat.indices(params),
  };

  cluster = {
    health: (params: ES7RequestParams.ClusterHealth): Promise<ApiResponse<ClusterHealthResponse>> =>
      this.client.cluster.health(params),
  };

  indices = {
    create: (params: ES7RequestParams.IndicesCreate) =>
      this.client.indices.create(params),
    delete: (params: ES7RequestParams.IndicesDelete) =>
      this.client.indices.delete(params),
    exists: (params: ES7RequestParams.IndicesExists): Promise<ApiResponse<IndicesExistsResponse>> =>
      this.client.indices.exists(params),
    existsAlias: (params: ES7RequestParams.IndicesExistsAlias): Promise<ApiResponse<IndicesExistsAliasResponse>> =>
      this.client.indices.existsAlias(params),
    putAlias: (params: ES7RequestParams.IndicesPutAlias) =>
      this.client.indices.putAlias(params),
    getAlias: (params: ES7RequestParams.IndicesGetAlias) =>
      this.client.indices.getAlias(params),
    updateAliases: (params: ES7RequestParams.IndicesUpdateAliases) =>
      this.client.indices.updateAliases(params),
    validateQuery: (params: ES7RequestParams.IndicesValidateQuery): Promise<ApiResponse<ValidateQueryResponse>> =>
      this.client.indices.validateQuery(params),
    stats: (params: ES7RequestParams.IndicesStats): Promise<ApiResponse<IndicesStatsResponse>> =>
      this.client.indices.stats(params),
  };

  nodes = {
    info: (): Promise<ApiResponse<NodesInfoResponse>> => (this.client.nodes.info()),
  };

  ping() {
    return this.client.ping();
  }

  reindex(params: ES7RequestParams.Reindex): Promise<ApiResponse<ReindexResponse>> {
    return this.client.reindex(params);
  }

  search(params: ES7RequestParams.Search): Promise<ApiResponse<SearchResponse>> {
    return this.client.search(params);
  }

}
