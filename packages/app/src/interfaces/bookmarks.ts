import { IUser } from '~/interfaces/user';

export interface IBookmarksInfo {
  isBookmarked: boolean
  sumOfBookmarks: number
  bookmarkedUsers: IUser[]
}
