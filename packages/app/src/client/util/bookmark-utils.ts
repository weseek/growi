import { BookmarkFolderItems } from '~/interfaces/bookmark-info';


export const hasChildren = (item: BookmarkFolderItems | BookmarkFolderItems[]): boolean => {
  if (item === null) {
    return false;
  }
  if (Array.isArray(item)) {
    return item.length > 0;
  }
  return item.children && item.children.length > 0;
};
