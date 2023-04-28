
import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/toastr';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRxCurrentUserBookmarks, useSWRBookmarkInfo } from '~/stores/bookmark';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';
import { usePageDeleteModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

import { BookmarkFolderItem } from './BookmarkFolderItem';
import { BookmarkItem } from './BookmarkItem';

import styles from './BookmarkFolderTree.module.scss';

// type DragItemDataType = {
//   bookmarkFolder: BookmarkFolderItems
//   level: number
//   parentFolder: BookmarkFolderItems | null
//  } & IPageHasId

export const BookmarkFolderTree: React.FC<{isUserHomePage?: boolean}> = ({ isUserHomePage }) => {
  // const acceptedTypes: DragItemType[] = [DRAG_ITEM_TYPE.FOLDER, DRAG_ITEM_TYPE.BOOKMARK];
  const { t } = useTranslation();

  const { data: currentPage } = useSWRxCurrentPage();
  const { mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);
  const { data: bookmarkFolders, mutate: mutateBookmarkFolders } = useSWRxBookmarkFolderAndChild();
  const { data: userBookmarks, mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();
  const { open: openDeleteModal } = usePageDeleteModal();

  const bookmarkFolderTreeMutation = useCallback(() => {
    mutateUserBookmarks();
    mutateBookmarkInfo();
    mutateBookmarkFolders();
  }, [mutateBookmarkFolders, mutateBookmarkInfo, mutateUserBookmarks]);

  const onClickDeleteBookmarkHandler = useCallback((pageToDelete: IPageToDeleteWithMeta) => {
    const pageDeletedHandler: OnDeletedFunction = (pathOrPathsToDelete, _isRecursively, isCompletely) => {
      if (typeof pathOrPathsToDelete !== 'string') return;

      toastSuccess(isCompletely ? t('deleted_pages_completely', { pathOrPathsToDelete }) : t('deleted_pages', { pathOrPathsToDelete }));

      bookmarkFolderTreeMutation();
    };
    openDeleteModal([pageToDelete], { onDeleted: pageDeletedHandler });
  }, [openDeleteModal, t, bookmarkFolderTreeMutation]);

  /* TODO: update in bookmarks folder v2. */
  // const itemDropHandler = async(item: DragItemDataType, dragType: string | null | symbol) => {
  //   if (dragType === DRAG_ITEM_TYPE.FOLDER) {
  //     try {
  //       await updateBookmarkFolder(item.bookmarkFolder._id, item.bookmarkFolder.name, null);
  //       await mutateBookmarkData();
  //       toastSuccess(t('toaster.update_successed', { target: t('bookmark_folder.bookmark_folder'), ns: 'commons' }));
  //     }
  //     catch (err) {
  //       toastError(err);
  //     }
  //   }
  //   else {
  //     try {
  //       await addBookmarkToFolder(item._id, null);
  //       await mutateUserBookmarks();
  //       toastSuccess(t('toaster.add_succeeded', { target: t('bookmark_folder.bookmark'), ns: 'commons' }));
  //     }
  //     catch (err) {
  //       toastError(err);
  //     }
  //   }

  // };
  // const isDroppable = (item: DragItemDataType, dragType: string | null | symbol) => {
  //   if (dragType === DRAG_ITEM_TYPE.FOLDER) {
  //     const isRootFolder = item.level === 0;
  //     return !isRootFolder;
  //   }
  //   const isRootBookmark = item.parentFolder == null;
  //   return !isRootBookmark;

  // };

  return (
    <div className={`grw-folder-tree-container ${styles['grw-folder-tree-container']}` } >
      <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group px-2 py-2`}>
        {bookmarkFolders?.map((bookmarkFolder) => {
          return (
            <BookmarkFolderItem
              key={bookmarkFolder._id}
              bookmarkFolder={bookmarkFolder}
              isOpen={false}
              level={0}
              root={bookmarkFolder._id}
              isUserHomePage={isUserHomePage}
              onClickDeleteBookmarkHandler={onClickDeleteBookmarkHandler}
              bookmarkFolderTreeMutation={bookmarkFolderTreeMutation}
            />
          );
        })}
        {userBookmarks?.map(userBookmark => (
          <div key={userBookmark._id} className="grw-foldertree-item-container grw-root-bookmarks">
            <BookmarkItem
              key={userBookmark._id}
              bookmarkedPage={userBookmark}
              level={0}
              parentFolder={null}
              isMoveToRoot={false}
              onClickDeleteBookmarkHandler={onClickDeleteBookmarkHandler}
              bookmarkFolderTreeMutation={bookmarkFolderTreeMutation}
            />
          </div>
        ))}
      </ul>
      {/* TODO: update in bookmarks folder v2. Also delete drop_item_here in translation.json, if don't need it. */}
      {/* {bookmarkFolderData != null && bookmarkFolderData.length > 0 && (
        <DragAndDropWrapper
          useDropMode={true}
          type={acceptedTypes}
          onDropItem={itemDropHandler}
          isDropable={isDroppable}
        >
          <div className="grw-drop-item-area">
            <div className="d-flex flex-column align-items-center">
              {t('bookmark_folder.drop_item_here')}
            </div>
          </div>
        </DragAndDropWrapper>
      )} */}
    </div>
  );
};
