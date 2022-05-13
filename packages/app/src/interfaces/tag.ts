export type IResTag<ID = string> = {
  _id: ID
  name: string,
}

export type IDataTagCount = IResTag & {count: number}


export type ITagsSearchApiv1Result = {
  ok: boolean,
  tags: string[]
}

export type ITagsListApiv1Result = {
  ok: boolean,
  data: IDataTagCount[],
  totalCount: number,
}
