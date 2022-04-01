export type ITag = {
  name: string,
  createdAt: Date;
}

export type ITagsSearchApiv1Result = {
  ok: boolean,
  tags: string[]
}
