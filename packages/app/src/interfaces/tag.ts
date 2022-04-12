export type ITag = {
  name: string,
  createdAt: Date;
}

export type ITagHasCount = ITag & { count: number }

export type ITagsSearchApiv1Result = {
  ok: boolean,
  tags: string[]
}
