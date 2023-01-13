import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/toastr';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { usePageDeleteModal } from '~/stores/modal';

import BookmarkItem from './BookmarkItem';

import styles from './BookmarkFolderTree.module.scss';


const BookmarkItemList = (): JSX.Element => {
  const { t } = useTranslation();
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
    <>
      {currentUserBookmarksData?.length === 0 && (
        <div className="pt-3">
          <h5 className="pl-3">
            { t('No bookmarks yet') }
          </h5>
        </div>
      )}
      <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group px-3 pt-2 pb-3`}>
        { currentUserBookmarksData?.map((currentUserBookmark) => {
          return (
            <BookmarkItem
              key={currentUserBookmark._id}
              bookmarkedPage={currentUserBookmark}
              onUnbookmarked={mutateCurrentUserBookmarks}
              onRenamed={mutateCurrentUserBookmarks}
              onClickDeleteMenuItem={deleteMenuItemClickHandler}
            />
          );
        })}
      </ul>
    </>
  );
};

export default BookmarkItemList;
