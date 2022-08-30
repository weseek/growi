import { Ref } from '@growi/core';

import { IUser } from '~/interfaces/user';

import { IPage } from './page';

export type IBookmarkInfo = {
  sumOfBookmarks: number;
  isBookmarked: boolean,
  bookmarkedUsers: IUser[]
};

export type BookmarkListPage = {
  _id: string,
  page: Populated<IPage>,
  user: Ref<IUser>,
  createdAt: Date,
}
