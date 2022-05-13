export type ITag<ID = string> = {
  _id: ID
  name: string,
}

export type IDataTagCount = ITag & {count: number}


export type IResTagsSearchApiv1 = {
  ok: boolean,
  tags: string[]
}

export type IResTagsListApiv1 = {
  ok: boolean,
  data: IDataTagCount[],
  totalCount: number,
}
