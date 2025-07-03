
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

  bulk(params: RequestParams.Bulk): Promise<ApiResponse<estypes.BulkResponse>> {
    return this.client.bulk(params);
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
    exists: (params: RequestParams.IndicesExists): Promise<ApiResponse<estypes.IndicesDeleteResponse>> => this.client.indices.exists(params),
    // eslint-disable-next-line max-len
    existsAlias: (params: RequestParams.IndicesExistsAlias): Promise<ApiResponse<estypes.IndicesExistsAliasResponse>> => this.client.indices.existsAlias(params),
    putAlias: (params: RequestParams.IndicesPutAlias): Promise<ApiResponse<estypes.IndicesUpdateAliasesResponse>> => this.client.indices.putAlias(params),
    getAlias: (params: RequestParams.IndicesGetAlias): Promise<ApiResponse<estypes.IndicesGetAliasResponse>> => this.client.indices.getAlias(params),
    // eslint-disable-next-line max-len
    updateAliases: (params: RequestParams.IndicesUpdateAliases): Promise<ApiResponse<estypes.IndicesUpdateAliasesResponse>> => this.client.indices.updateAliases(params),
    // eslint-disable-next-line max-len
    validateQuery: (params:RequestParams.IndicesValidateQuery): Promise<ApiResponse<estypes.IndicesValidateQueryResponse>> => this.client.indices.validateQuery(params),
    stats: async(params: RequestParams.IndicesStats): Promise<ApiResponse<estypes.IndicesStatsResponse>> => this.client.indices.stats(params),
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

  search(params: RequestParams.Search): Promise<ApiResponse<estypes.SearchResponse>> {
    return this.client.search(params);
  }

}
