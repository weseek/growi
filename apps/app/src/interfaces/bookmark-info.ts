import { Ref } from '@growi/core';

import { IPageHasId } from '~/interfaces/page';
import { IUser } from '~/interfaces/user';

export interface IBookmarkInfo {
  sumOfBookmarks: number;
  isBookmarked: boolean,
  bookmarkedUsers: IUser[]
}

export interface BookmarkedPage {
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

export interface BookmarkFolderItems extends IBookmarkFolder {
  _id: any;
  children: BookmarkFolderItems[];
  bookmarks: BookmarkedPage[];
}

export const DRAG_ITEM_TYPE = {
  FOLDER: 'FOLDER',
  BOOKMARK: 'BOOKMARK',
} as const;

interface BookmarkDragItem {
  bookmarkFolder: BookmarkFolderItems
  level: number
  root: string
}

export interface DragItemDataType extends BookmarkDragItem, IPageHasId {
  parentFolder: BookmarkFolderItems | null
}

export type DragItemType = typeof DRAG_ITEM_TYPE[keyof typeof DRAG_ITEM_TYPE];
