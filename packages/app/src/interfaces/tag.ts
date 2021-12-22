export type ITag = {
  name: string,
  createdAt: Date;
}

export type GetPageTagResponse = {
  tags: string[];
  ok: boolean;
};
