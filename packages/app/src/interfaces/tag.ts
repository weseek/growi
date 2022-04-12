export type ITag = {
  _id: string
  name: string,
  createdAt: Date;
}

export type ITagHasCount = ITag & { count: number }

export type ITagsSearchApiv1Result = {
  ok: boolean,
  tags: string[]
}

export type ITagsListApiv1Result = {
  ok: boolean,
  data: ITagHasCount[],
  totalCount: number,
}
