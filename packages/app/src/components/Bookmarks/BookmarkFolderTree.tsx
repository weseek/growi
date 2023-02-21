
import { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/toastr';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRBookmarkInfo, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { usePageDeleteModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

import BookmarkFolderItem from './BookmarkFolderItem';
import BookmarkItem from './BookmarkItem';

import styles from './BookmarkFolderTree.module.scss';


type BookmarkFolderTreeProps = {
  isUserHomePage?: boolean
}

const BookmarkFolderTree = (props: BookmarkFolderTreeProps): JSX.Element => {
  const { t } = useTranslation();
  const { isUserHomePage } = props;
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: bookmarkFolderData } = useSWRxBookamrkFolderAndChild();
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
    };
    openDeleteModal([pageToDelete], { onDeleted: pageDeletedHandler });
  }, [mutateBookmarkInfo, mutateUserBookmarks, openDeleteModal, t]);

  return (
    <>
      <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group px-3 pt-3`}>
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
            />
          </div>
        ))}
      </ul>

    </>
  );


};

export default BookmarkFolderTree;
