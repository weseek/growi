import { Ref } from '@growi/core';

import { IPageHasId } from '~/interfaces/page';
import { IUser } from '~/interfaces/user';

export type IBookmarkInfo = {
  sumOfBookmarks: number;
  isBookmarked: boolean,
  bookmarkedUsers: IUser[]
};

type BookmarkedPage = {
  _id: string,
  page: IPageHasId,
  user: Ref<IUser>,
  createdAt: Date,
}

export type MyBookmarkList = BookmarkedPage[]

export interface IBookmarkFolder {
  name: string
  owner: Ref<IUser>
  parent?: Ref<this>
}

export interface BookmarkFolderItems {
  _id: string
  name: string
  parent: string
  children: this[]
}
