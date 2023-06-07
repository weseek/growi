
import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastError, toastSuccess } from '~/client/util/toastr';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRxUserBookmarks, useSWRBookmarkInfo } from '~/stores/bookmark';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';
import { useIsReadOnlyUser, useCurrentUser } from '~/stores/context';
import { usePageDeleteModal, usePutBackPageModal } from '~/stores/modal';
import { useSWRxCurrentPage, mutateAllPageInfo } from '~/stores/page';

import { BookmarkFolderItem } from './BookmarkFolderItem';
import { BookmarkItem } from './BookmarkItem';

import styles from './BookmarkFolderTree.module.scss';
import { unlink } from '~/client/services/page-operation';
import { useRouter } from 'next/router';

// type DragItemDataType = {
//   bookmarkFolder: BookmarkFolderItems
//   level: number
//   parentFolder: BookmarkFolderItems | null
//  } & IPageHasId

type Props = {
  isUserHomePage?: boolean,
  userId?: string,
  isOperable: boolean,
}

export const BookmarkFolderTree: React.FC<Props> = (props: Props) => {
  const { isUserHomePage, userId } = props;

  // const acceptedTypes: DragItemType[] = [DRAG_ITEM_TYPE.FOLDER, DRAG_ITEM_TYPE.BOOKMARK];
  const { t } = useTranslation();
  const router = useRouter();

  // In order to update the bookmark information in the sidebar when bookmarking or unbookmarking a page on someone else's user homepage
  const { data: currentUser } = useCurrentUser();
  const shouldMutateCurrentUserbookmarks = currentUser?._id !== userId;

  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: currentPage } = useSWRxCurrentPage();
  const { mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);
  const { data: bookmarkFolders, mutate: mutateBookmarkFolders } = useSWRxBookmarkFolderAndChild(userId);
  const { data: userBookmarks, mutate: mutateUserBookmarks } = useSWRxUserBookmarks(userId);
  const { mutate: mutateCurrentUserBookmarks } = useSWRxUserBookmarks(shouldMutateCurrentUserbookmarks ? currentUser?._id : undefined);
  const { open: openDeleteModal } = usePageDeleteModal();
  const { open: openPutBackPageModal } = usePutBackPageModal();

  const bookmarkFolderTreeMutation = useCallback(() => {
    mutateUserBookmarks();
    mutateCurrentUserBookmarks();
    mutateBookmarkInfo();
    mutateBookmarkFolders();
  }, [mutateBookmarkFolders, mutateBookmarkInfo, mutateCurrentUserBookmarks, mutateUserBookmarks]);

  const onClickDeleteMenuItemHandler = useCallback((pageToDelete: IPageToDeleteWithMeta) => {
    const pageDeletedHandler: OnDeletedFunction = (pathOrPathsToDelete, _isRecursively, isCompletely) => {
      if (typeof pathOrPathsToDelete !== 'string') return;
      toastSuccess(isCompletely ? t('deleted_pages_completely', { path: pathOrPathsToDelete }) : t('deleted_pages', { path: pathOrPathsToDelete }));
      bookmarkFolderTreeMutation();
      mutateAllPageInfo();
      if (pageToDelete.data._id === currentPage?._id && _isRecursively) {
        router.push(`/trash${currentPage.path}`);
      }
    };
    openDeleteModal([pageToDelete], { onDeleted: pageDeletedHandler });
  }, [openDeleteModal, t, bookmarkFolderTreeMutation, router, mutateAllPageInfo]);

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
  const putBackClickHandler = useCallback(async(pagePath: string) => {
    const bookmarkedPage = userBookmarks?.filter(userBookmark => userBookmark._id === pagePath)[0];
    if (bookmarkedPage != null) {
      const { _id: pageId, path } = bookmarkedPage;
      const putBackedHandler = async() => {
        try {
          await unlink(path);
          mutateAllPageInfo();
          bookmarkFolderTreeMutation();
          // Redirect to original page if current page id equal to bookmarked page
          if (bookmarkedPage._id === currentPage?._id) {
            router.push(`/${pageId}`);
          }
          toastSuccess(t('page_has_been_reverted', { path }));
        }
        catch (err) {
          toastError(err);
        }

      };
      openPutBackPageModal({ pageId, path }, { onPutBacked: putBackedHandler });
    }
  }, [userBookmarks, openPutBackPageModal, mutateAllPageInfo]);


  return (
    <div className={`grw-folder-tree-container ${styles['grw-folder-tree-container']}` } >
      <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group px-2 py-2`}>
        {bookmarkFolders?.map((bookmarkFolder) => {
          return (
            <BookmarkFolderItem
              key={bookmarkFolder._id}
              isReadOnlyUser={!!isReadOnlyUser}
              isOperable={props.isOperable}
              bookmarkFolder={bookmarkFolder}
              isOpen={false}
              level={0}
              root={bookmarkFolder._id}
              isUserHomePage={isUserHomePage}
              onClickDeleteMenuItemHandler={onClickDeleteMenuItemHandler}
              bookmarkFolderTreeMutation={bookmarkFolderTreeMutation}
            />
          );
        })}
        {userBookmarks?.map(userBookmark => (
          <div key={userBookmark._id} className="grw-foldertree-item-container grw-root-bookmarks">
            <BookmarkItem
              key={userBookmark._id}
              isReadOnlyUser={!!isReadOnlyUser}
              isOperable={props.isOperable}
              bookmarkedPage={userBookmark}
              level={0}
              parentFolder={null}
              canMoveToRoot={false}
              onClickDeleteMenuItemHandler={onClickDeleteMenuItemHandler}
              bookmarkFolderTreeMutation={bookmarkFolderTreeMutation}
              onPagePutBacked={putBackClickHandler}
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
