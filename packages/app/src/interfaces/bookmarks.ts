import { Types } from 'mongoose';

export interface IBookmarksInfo {
  isBookmarked: boolean
  sumOfBookmarks: number
  bookmarkedUserIds: Types.ObjectId[]
}
