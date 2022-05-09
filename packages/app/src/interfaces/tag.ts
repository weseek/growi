export type ITag<ID = string> = {
  _id: ID
  name: string,
  createdAt: Date;
  count: number;
}

export type ITagsSearchApiv1Result = {
  ok: boolean,
  tags: string[]
}

export type ITagsListApiv1Result = {
  ok: boolean,
  data: ITag[],
  totalCount: number,
}
