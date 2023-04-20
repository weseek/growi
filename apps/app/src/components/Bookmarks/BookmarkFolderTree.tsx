
import { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { addBookmarkToFolder, updateBookmarkFolder } from '~/client/util/bookmark-utils';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { BookmarkFolderItems, DragItemType, DRAG_ITEM_TYPE } from '~/interfaces/bookmark-info';
import { IPageHasId, IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRBookmarkInfo, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';
import { usePageDeleteModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

import { BookmarkFolderItem } from './BookmarkFolderItem';
import { BookmarkItem } from './BookmarkItem';
import { DragAndDropWrapper } from './DragAndDropWrapper';

import styles from './BookmarkFolderTree.module.scss';


type BookmarkFolderTreeProps = {
  isUserHomePage?: boolean
}

type DragItemDataType = {
  bookmarkFolder: BookmarkFolderItems
  level: number
  parentFolder: BookmarkFolderItems | null
 } & IPageHasId

export const BookmarkFolderTree = (props: BookmarkFolderTreeProps): JSX.Element => {
  const acceptedTypes: DragItemType[] = [DRAG_ITEM_TYPE.FOLDER, DRAG_ITEM_TYPE.BOOKMARK];
  const { t } = useTranslation();
  const { isUserHomePage } = props;
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: bookmarkFolderData, mutate: mutateBookmarkData } = useSWRxBookmarkFolderAndChild();
  const { data: userBookmarks, mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();
  const { mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);

  const { open: openDeleteModal } = usePageDeleteModal();

  const onUnbookmarkHandler = useCallback(() => {
    mutateUserBookmarks();
    mutateBookmarkInfo();
  }, [mutateBookmarkInfo, mutateUserBookmarks]);

  const onClickDeleteBookmarkHandler = useCallback((pageToDelete: IPageToDeleteWithMeta) => {
    const pageDeletedHandler: OnDeletedFunction = (pathOrPathsToDelete, _isRecursively, isCompletely) => {
      if (typeof pathOrPathsToDelete !== 'string') {
        return;
      }
      const path = pathOrPathsToDelete;

      if (isCompletely) {
        toastSuccess(t('deleted_pages_completely', { path }));
      }
      else {
        toastSuccess(t('deleted_pages', { path }));
      }
      mutateUserBookmarks();
      mutateBookmarkInfo();
      mutateBookmarkData();
    };
    openDeleteModal([pageToDelete], { onDeleted: pageDeletedHandler });
  }, [mutateBookmarkInfo, mutateBookmarkData, mutateUserBookmarks, openDeleteModal, t]);

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
        {bookmarkFolderData?.map((item) => {
          return (
            <BookmarkFolderItem
              key={item._id}
              bookmarkFolder={item}
              isOpen={false}
              level={0}
              root={item._id}
              isUserHomePage={isUserHomePage}
            />
          );
        })}
        {userBookmarks?.map(page => (
          <div key={page._id} className="grw-foldertree-item-container grw-root-bookmarks">
            <BookmarkItem
              bookmarkedPage={page}
              key={page._id}
              onUnbookmarked={onUnbookmarkHandler}
              onRenamed={mutateUserBookmarks}
              onClickDeleteMenuItem={onClickDeleteBookmarkHandler}
              parentFolder={null}
              level={0}
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
