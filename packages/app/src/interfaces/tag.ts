export type ITag<ID = string> = {
  _id: ID
  name: string,
}

export type IDataTagCount = ITag & {count: number}

export type ITagNames = ITag['name'][]

export type IPageTagsInfo = {
  tags : ITagNames,
}

export type IListTagNamesByPage = ITagNames


export type IResTagsSearchApiv1 = {
  ok: boolean,
  tags: ITagNames
}

export type IResGetPageTags = {
  ok: boolean,
  tags: ITagNames,
};

export type IResTagsListApiv1 = {
  ok: boolean,
  data: IDataTagCount[],
  totalCount: number,
}
