export type NodesInfoResponse = {
  nodes: Record<
    string,
    {
      version: string
      plugins: Plugin[]
    }
  >
}

export type CatIndicesResponse = {
  index: string
}[]

export type IndicesExistsAliasResponse = boolean

export type CatAliasesResponse = {
  alias: string
  index: string
  filter: string
}[]

export type BulkResponse = {
  took: number
  errors: boolean
  items: Record<string, any>[]
}

export type SearchResponse = {
  took: number
  // eslint-disable-next-line camelcase
  timed_out: boolean
  _shards: {
    total: number
    successful: number
    skipped: number
    failed: number
  }
  hits: {
    total: number | {
      value: number
      relation: string
    } // 6.x.x | 7.x.x
    // eslint-disable-next-line camelcase
    max_score: number | null
    hits: Record<string, {
      _index: string
      _type: string
      _id: string
      _score: number
      _source: any
    }>[]
  }
}
