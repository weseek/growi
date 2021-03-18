import { User } from '~/interfaces/user';

export type Page = {
  _id: string,
  path: string,
  status: string,
  revision: Revision,
  tags: Tag[],
  creator: User,
  createdAt: Date,
  updatedAt: Date,
  seenUsers: string[]
}

export type BookmarkInfo = {
  sumOfBookmarks: number,
  isBookmarked: boolean,
}

export type LikeInfo = {
  sumOfLikers: number,
  isLiked: boolean,
}

export type Tag = {
  name: string,
}

export type PageTagRelation = {
  relatedPage: Page,
  relatedTag: Tag,
}

export type Comment = {
  _id: string,
  page: Page,
  comment: string,
  replyTo?: string,
  creator: User,
  isMarkdown: boolean,
  createdAt: Date,
  updatedAt: Date,
  revision: Revision,
}

export type Revision = {
  _id: string,
  body: string,
  author: User,
  hasDiffToPrev: boolean;
  createdAt: Date,
  updatedAt: Date,
}

export type PaginationResult<T> = {
  docs: T[],
  page: number,
  totalDocs: number,
  limit: number,
}

export type PaginationResultByQueryBuilder = {
  pages: Page[],
  offset: number,
  totalCount: number,
  limit: number,
}

export type Attachment = {
  _id: string,
  creator: User,
  filePath: string,
  fileName: string,
  originalName: string,
  fileFormat: string,
  fileSize: number,
  createdAt: Date,
  temporaryUrlCached: string,
  temporaryUrlExpiredAt: Date,
  filePathProxied: string,
  downloadPathProxied: string,
}

export type ShareLink = {
  _id: string,
  relatedPage: Page,
  expiredAt: Date,
  description: string,
  createdAt: Date,
}

export type Bookmark = {
  _id: string,
  page: Page;
  user: User;
  createdAt: Date;
}

export type ITag = {
  _id: string,
  name: string,
  createdAt: Date;
}
