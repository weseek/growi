
import { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/apiNotification';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { usePageDeleteModal } from '~/stores/modal';

import BookmarkFolderItem from './BookmarkFolderItem';
import BookmarkItem from './BookmarkItem';

import styles from './BookmarkFolderTree.module.scss';


const BookmarkFolderTree = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUserBookmarksData, mutate: mutateCurrentUserBookmarks } = useSWRxCurrentUserBookmarks();
  const { data: bookmarkFolderData } = useSWRxBookamrkFolderAndChild();
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
      <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group p-3`}>
        {bookmarkFolderData?.map((item) => {
          return (
            <BookmarkFolderItem
              key={item._id}
              bookmarkFolder={item}
              isOpen={false}
              isSidebarItem={true}
            />
          );
        })}
        {currentUserBookmarksData?.length === 0 && (
          <div className="pt-3">
            <h5 className="pl-3">
              { t('No bookmarks yet') }
            </h5>
          </div>
        )}
        { currentUserBookmarksData?.map((currentUserBookmark) => {
          return (
            <BookmarkItem
              key={currentUserBookmark._id}
              bookmarkedPage={currentUserBookmark}
              onUnbookmarked={mutateCurrentUserBookmarks}
              onRenamed={mutateCurrentUserBookmarks}
              onClickDeleteMenuItem={deleteMenuItemClickHandler}
              isSidebarItem={true}
            />
          );
        })}
      </ul>
    </>
  );


};

export default BookmarkFolderTree;
