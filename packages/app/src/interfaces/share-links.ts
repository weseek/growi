export type IRelatedPage = {
  id: string,
  path: string,
}

export type IShareLink = {
  relatedPage: IRelatedPage,
  expireAt: Date,
  description: string,
  createdAt: Date,
};
