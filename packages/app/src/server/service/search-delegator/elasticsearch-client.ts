/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
import { Client as ES6Client, ApiResponse as ES6ApiResponse, RequestParams as ES6RequestParams } from '@elastic/elasticsearch6';
import { Client as ES7Client, ApiResponse as ES7ApiResponse, RequestParams as ES7RequestParams } from '@elastic/elasticsearch7';
import {
  BulkResponse,
  CatAliasesResponse,
  CatIndicesResponse,
  IndicesExistsAliasResponse,
  NodesInfoResponse,
  SearchResponse,
} from './elasticsearch-client-types';

type ApiResponse<T = any, C = any> = ES6ApiResponse<T, C> | ES7ApiResponse<T, C>

export default class ElasticsearchClient {

  client: ES6Client | ES7Client

  constructor(client: ES6Client | ES7Client) {
    this.client = client;
  }

  bulk(params: ES6RequestParams.Bulk & ES7RequestParams.Bulk): Promise<ApiResponse<BulkResponse>> {
    return this.client instanceof ES6Client ? this.client.bulk(params) : this.client.bulk(params);
  }

  // cat is not used in current Implementation
  cat = {
    aliases: (params: ES6RequestParams.CatAliases & ES7RequestParams.CatAliases): Promise<ApiResponse<CatAliasesResponse>> =>
      this.client instanceof ES6Client ? this.client.cat.aliases(params) : this.client.cat.aliases(params),
    indices: (params: ES6RequestParams.CatIndices & ES7RequestParams.CatIndices): Promise<ApiResponse<CatIndicesResponse>> =>
      this.client instanceof ES6Client ? this.client.cat.indices(params) : this.client.cat.indices(params),
  }

  indices = {
    create: (params: ES6RequestParams.IndicesCreate & ES7RequestParams.IndicesCreate) =>
      this.client instanceof ES6Client ? this.client.indices.create(params) : this.client.indices.create(params),
    delete: (params: ES6RequestParams.IndicesDelete & ES7RequestParams.IndicesDelete) =>
      this.client instanceof ES6Client ? this.client.indices.delete(params) : this.client.indices.delete(params),
    existsAlias: (params: ES6RequestParams.IndicesExistsAlias & ES7RequestParams.IndicesExistsAlias): Promise<ApiResponse<IndicesExistsAliasResponse>> =>
      this.client instanceof ES6Client ? this.client.indices.existsAlias(params) : this.client.indices.existsAlias(params),
    putAlias: (params: ES6RequestParams.IndicesPutAlias & ES7RequestParams.IndicesPutAlias) =>
      this.client instanceof ES6Client ? this.client.indices.putAlias(params) : this.client.indices.putAlias(params),
    updateAliases: (params: ES6RequestParams.IndicesUpdateAliases & ES7RequestParams.IndicesUpdateAliases) =>
      this.client instanceof ES6Client ? this.client.indices.updateAliases(params) : this.client.indices.updateAliases(params),
  }

  nodes = {
    info: (): Promise<ApiResponse<NodesInfoResponse>> => (this.client instanceof ES6Client ? this.client.nodes.info() : this.client.nodes.info()),
  }

  ping() {
    return this.client instanceof ES6Client ? this.client.ping() : this.client.ping();
  }

  search(params: ES6RequestParams.Search & ES7RequestParams.Search): Promise<ApiResponse<SearchResponse>> {
    return this.client instanceof ES6Client ? this.client.search(params) : this.client.search(params);
  }

}
