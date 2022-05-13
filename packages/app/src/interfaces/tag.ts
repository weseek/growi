export type ITag<ID = string> = {
  _id: ID
  name: string,
}

export type ITagCount = ITag & {count: number}


export type ITagsSearchApiv1Result = {
  ok: boolean,
  tags: string[]
}

export type ITagsListApiv1Result = {
  ok: boolean,
  data: ITagCount[],
  totalCount: number,
}
