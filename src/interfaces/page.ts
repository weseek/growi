
export type Page = {
  id: string,
  path: string,
  status: string,
  revision: string,
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
