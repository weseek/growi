import {
  Client,
  type ClientOptions,
  type ApiResponse,
  type RequestParams,
  type estypes,
} from '@elastic/elasticsearch7';

export class ES7ClientDelegator {

  private client: Client;

  constructor(options: ClientOptions, rejectUnauthorized: boolean) {
    this.client = new Client({ ...options, ssl: { rejectUnauthorized } });
  }

  async bulk(params: RequestParams.Bulk): Promise<estypes.BulkResponse> {
    const res = (await this.client.bulk(params)).body as estypes.BulkResponse;
    return res;
  }

  cat = {
    aliases: (params: RequestParams.CatAliases): Promise<ApiResponse<estypes.CatAliasesResponse>> => this.client.cat.aliases(params),
    indices: (params: RequestParams.CatIndices): Promise<ApiResponse<estypes.CatIndicesResponse>> => this.client.cat.indices(params),
  };

  cluster = {
    health: (): Promise<ApiResponse<estypes.ClusterHealthResponse>> => this.client.cluster.health(),
  };

  indices = {
    create: (params: RequestParams.IndicesCreate): Promise<ApiResponse<estypes.IndicesCreateResponse>> => this.client.indices.create(params),
    delete: (params: RequestParams.IndicesDelete): Promise<ApiResponse<estypes.IndicesDeleteResponse>> => this.client.indices.delete(params),
    exists: async(params: RequestParams.IndicesExists): Promise<estypes.IndicesExistsResponse> => {
      const res = (await this.client.indices.exists(params)).body;
      return res;
    },
    existsAlias: async(params: RequestParams.IndicesExistsAlias): Promise<estypes.IndicesExistsAliasResponse> => {
      const res = (await this.client.indices.existsAlias(params)).body;
      return res;
    },
    putAlias: (params: RequestParams.IndicesPutAlias): Promise<ApiResponse<estypes.IndicesUpdateAliasesResponse>> => this.client.indices.putAlias(params),
    getAlias: async(params: RequestParams.IndicesGetAlias): Promise<estypes.IndicesGetAliasResponse> => {
      const res = (await this.client.indices.getAlias(params)).body as estypes.IndicesGetAliasResponse;
      return res;
    },
    updateAliases: (params: RequestParams.IndicesUpdateAliases): Promise<ApiResponse<estypes.IndicesUpdateAliasesResponse>> => {
      return this.client.indices.updateAliases(params);
    },
    validateQuery: async(params:RequestParams.IndicesValidateQuery): Promise<estypes.IndicesValidateQueryResponse> => {
      const res = (await this.client.indices.validateQuery(params)).body as estypes.IndicesValidateQueryResponse;
      return res;
    },
    stats: async(params: RequestParams.IndicesStats): Promise<estypes.IndicesStatsResponse> => {
      const res = (await this.client.indices.stats(params)).body as estypes.IndicesStatsResponse;
      return res;
    },
  };

  nodes = {
    info: (): Promise<ApiResponse<estypes.NodesInfoResponse>> => this.client.nodes.info(),
  };

  ping(): Promise<ApiResponse<estypes.PingResponse>> {
    return this.client.ping();
  }

  reindex(indexName: string, tmpIndexName: string): Promise<ApiResponse<estypes.ReindexResponse>> {
    return this.client.reindex({ wait_for_completion: false, body: { source: { index: indexName }, dest: { index: tmpIndexName } } });
  }

  async search(params: RequestParams.Search): Promise<estypes.SearchResponse> {
    const res = (await this.client.search(params)).body as estypes.SearchResponse;
    return res;
  }

}
