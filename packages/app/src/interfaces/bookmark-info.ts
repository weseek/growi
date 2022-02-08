import { IUser } from '~/interfaces/user';

export type IBookmarkInfo = {
  sumOfBookmarks: number;
  isBookmarked: boolean,
  bookmarkedUsers: IUser[]
};
