
import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRxCurrentUserBookmarkFolders, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useIsGuestUser } from '~/stores/context';
import { usePageDeleteModal } from '~/stores/modal';


import BookmarkFolder from './Bookmarks/BookmarkFolder';
import BookmarkItem from './Bookmarks/BookmarkItem';

const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: currentUserBookmarksData, mutate: mutateCurrentUserBookmarks } = useSWRxCurrentUserBookmarks();
  const { data: currentUserBookmarkFolder, mutate: mutateCurrentUserBookmarkFolder } = useSWRxCurrentUserBookmarkFolders();
  const { open: openDeleteModal } = usePageDeleteModal();

  const [isRenameFolderShown, setIsRenameFolderShown] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');
  const [currentParentFolder, setCurrentParentFolder] = useState(null);

  const deleteMenuItemClickHandler = (pageToDelete: IPageToDeleteWithMeta) => {
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
  };

  const onPressEnterHandler = async(folderName: string) => {
    setFolderName(folderName);
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: currentParentFolder });
      setIsRenameFolderShown(false);
      setFolderName('');
      mutateCurrentUserBookmarkFolder();
      toastSuccess(t('Create New Bookmark Folder Success'));
    }
    catch (err) {
      toastError(err);
    }
  };

  const onClickOutsideHandler = () => {
    setIsRenameFolderShown(false);
    setFolderName('');
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
                onClickDeleteMenuItem={deleteMenuItemClickHandler}
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
      {!isGuestUser && (
        <>
          <BookmarkFolder
            onClickNewFolder={() => setIsRenameFolderShown(true)}
            isRenameInputShown={isRenameFolderShown}
            onClickOutside={onClickOutsideHandler}
            onPressEnter={onPressEnterHandler}
            folderName={folderName}
          />
          {/* TODO: List Bookmark Folder */}
          <ul>
            {currentUserBookmarkFolder?.map((bookmarkFolder, idx) => {
              return (
                <li key={idx}>{bookmarkFolder.name}</li>
              );
            })}
          </ul>
        </>
      )
      }
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
