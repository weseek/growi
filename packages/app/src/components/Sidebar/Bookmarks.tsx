
import React from 'react';

import { useTranslation } from 'react-i18next';

import { toastSuccess } from '~/client/util/apiNotification';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useIsGuestUser } from '~/stores/context';
import { usePageDeleteModal } from '~/stores/modal';


import BookmarkItem from './Bookmarks/BookmarkItem';


const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: currentUserBookmarksData, mutate: mutateCurrentUserBookmarks } = useSWRxCurrentUserBookmarks();
  const { open: openDeleteModal } = usePageDeleteModal();

  const onBookmarkItemDeleted = (pageToDelete: IPageToDeleteWithMeta): void => {
    const onDeletedHandler: OnDeletedFunction = (pathOrPathsToDelete, _isRecursively, isCompletely) => {
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
    openDeleteModal([pageToDelete], { onDeleted: onDeletedHandler });
  };

  const renderBookmarkList = () => {
    if (currentUserBookmarksData?.length === 0) {
      return (
        <h4 className="pl-3">
          { t('No bookmarks yet') }
        </h4>
      );
    }
    return (
      <ul className="grw-bookmarks-list list-group p-3">
        <div className="grw-bookmarks-item-container">
          { currentUserBookmarksData?.map((currentUserBookmark) => {
            return (
              <BookmarkItem
                key={currentUserBookmark._id}
                bookmarkedPage={currentUserBookmark}
                onUnbookmarked={mutateCurrentUserBookmarks}
                onRenamed={mutateCurrentUserBookmarks}
                onDeleted={onBookmarkItemDeleted}
              />
            );
          })}
        </div>
      </ul>
    );
  };

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>
      { isGuestUser
        ? (
          <h4 className="pl-3">
            { t('Not available for guest') }
          </h4>
        ) : renderBookmarkList()
      }
    </>
  );
};

export default Bookmarks;
