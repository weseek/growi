import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/apiNotification';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { usePageDeleteModal } from '~/stores/modal';

import BookmarkFolderItem from '../Bookmarks/BookmarkFolderItem';
import BookmarkItem from '../Bookmarks/BookmarkItem';


import styles from './BookmarkContents.module.scss';

const BookmarkContents = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: bookmarkFolderData } = useSWRxBookamrkFolderAndChild(null);
  const { data: currentUserBookmarksData, mutate: mutateCurrentUserBookmarks } = useSWRxCurrentUserBookmarks();
  const { open: openDeleteModal } = usePageDeleteModal();

  const deleteMenuItemClickHandler = useCallback((pageToDelete: IPageToDeleteWithMeta) => {
    const pageDeletedHandler : OnDeletedFunction = (pathOrPathsToDelete, _isRecursively, isCompletely) => {
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
      mutateCurrentUserBookmarks();
    };
    openDeleteModal([pageToDelete], { onDeleted: pageDeletedHandler });
  }, [mutateCurrentUserBookmarks, openDeleteModal, t]);

  return (
    <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group p-3`}>
      {bookmarkFolderData?.map((item) => {
        return (
          <BookmarkFolderItem
            key={item._id}
            bookmarkFolder={item}
            isOpen={false}
            isSidebarItem={false}
          />
        );
      })}
      <div id="user-bookmark-list" className={`page-list ${styles['page-list']}`}>
        {currentUserBookmarksData?.length === 0 ? t('No bookmarks yet') : (
          <>
            <ul className="page-list-ul page-list-ul-flat my-3">
              {currentUserBookmarksData?.map(page => (
                <BookmarkItem
                  key={page._id}
                  onClickDeleteMenuItem={deleteMenuItemClickHandler}
                  onRenamed={mutateCurrentUserBookmarks}
                  onUnbookmarked={mutateCurrentUserBookmarks}
                  bookmarkedPage={page}
                  isSidebarItem={false}
                />
              ))}

            </ul>
          </>
        ) }
      </div>
    </ul>
  );
};

export default BookmarkContents;
