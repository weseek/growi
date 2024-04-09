import type { IRevision, Ref } from '@growi/core';

import type { BookmarkFolderItems, BookmarkedPage } from '~/interfaces/bookmark-info';

import { apiv3Delete, apiv3Post, apiv3Put } from './apiv3-client';

// Check if bookmark folder item has children or bookmarks
export const hasChildren = ({ children, bookmarks }: { children?: BookmarkFolderItems[], bookmarks?: BookmarkedPage[] }): boolean => {
  return !!((children && children.length > 0) || (bookmarks && bookmarks.length > 0));
};

// Add new folder helper
export const addNewFolder = async(name: string, parent: string | null): Promise<void> => {
  await apiv3Post('/bookmark-folder', { name, parent });
};

// Put bookmark to a folder
export const addBookmarkToFolder = async(pageId: string, folderId: string | null): Promise<void> => {
  await apiv3Post('/bookmark-folder/add-boookmark-to-folder', { pageId, folderId });
};

// Delete bookmark folder
export const deleteBookmarkFolder = async(bookmarkFolderId: string): Promise<void> => {
  await apiv3Delete(`/bookmark-folder/${bookmarkFolderId}`);
};

// Rename page from bookmark item control
export const renamePage = async(pageId: string, revisionId: Ref<IRevision> | undefined, newPagePath: string): Promise<void> => {
  await apiv3Put('/pages/rename', { pageId, revisionId, newPagePath });
};

// Update bookmark by isBookmarked status
export const toggleBookmark = async(pageId: string, status: boolean): Promise<void> => {
  await apiv3Put('/bookmark-folder/update-bookmark', { pageId, status });
};

// Update Bookmark folder
export const updateBookmarkFolder = async(bookmarkFolderId: string, name: string, parent: string | null, children: BookmarkFolderItems[]): Promise<void> => {
  await apiv3Put('/bookmark-folder', {
    bookmarkFolderId, name, parent, children,
  });
};
