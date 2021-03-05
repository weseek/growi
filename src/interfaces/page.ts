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
  seenUsers: User[]
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

export type Comment = {
  _id: string,
  page: Page,
  comment: string,
  replyTo?: string,
  creator: User,
}

export type Revision = {
  _id: string,
  author: User,
  hasDiffToPrev: boolean;
}

export type PaginationResult<T> = {
  docs: T[],
  page: number,
  totalDocs: number,
  limit: number,
}
