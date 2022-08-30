import { IPageHasId } from '~/interfaces/page';
import { IUser } from '~/interfaces/user';

export type IBookmarkInfo = {
  sumOfBookmarks: number;
  isBookmarked: boolean,
  bookmarkedUsers: IUser[]
};

export type BookmarkListPage = {
  _id: string,
  page: IPageHasId,
  user: string,
  createdAt: Date,
}
