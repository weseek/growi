import React, {
  useCallback, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem, DropdownMenu, UncontrolledDropdown,
} from 'reactstrap';

import { addBookmarkToFolder, addNewFolder, toggleBookmark } from '~/client/util/bookmark-utils';
import { toastError } from '~/client/util/toastr';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { onDeletedBookmarkFolderFunction } from '~/interfaces/ui';
import { useSWRBookmarkInfo, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';
import { useBookmarkFolderDeleteModal } from '~/stores/modal';
import { useSWRxCurrentPage, useSWRxPageInfo } from '~/stores/page';

import { FolderIcon } from '../Icons/FolderIcon';

import { BookmarkFolderMenuItem } from './BookmarkFolderMenuItem';
import { BookmarkFolderNameInput } from './BookmarkFolderNameInput';

export const BookmarkFolderMenu: React.FC<{children?: React.ReactNode}> = ({ children }): JSX.Element => {
  const { t } = useTranslation();

  const [isCreateAction, setIsCreateAction] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: bookmarkFolders, mutate: mutateBookmarkFolders } = useSWRxBookmarkFolderAndChild();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: bookmarkInfo, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);
  const { mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();
  const { mutate: mutatePageInfo } = useSWRxPageInfo(currentPage?._id);
  const { open: openDeleteBookmarkFolderModal } = useBookmarkFolderDeleteModal();

  const isBookmarked = bookmarkInfo?.isBookmarked ?? false;

  const toggleBookmarkHandler = useCallback(async() => {
    try {
      if (currentPage != null) {
        await toggleBookmark(currentPage._id, isBookmarked);
      }
    }
    catch (err) {
      toastError(err);
    }
  }, [currentPage, isBookmarked]);

  const onClickNewBookmarkFolder = useCallback(() => {
    setIsCreateAction(true);
  }, []);

  const onUnbookmarkHandler = useCallback(async() => {
    await toggleBookmarkHandler();
    mutateUserBookmarks();
    mutateBookmarkInfo();
    mutateBookmarkFolders();
    mutatePageInfo();
    setSelectedItem(null);
  }, [mutateBookmarkFolders, mutateBookmarkInfo, mutatePageInfo, mutateUserBookmarks, toggleBookmarkHandler]);

  const toggleHandler = useCallback(async() => {
    setIsOpen(!isOpen);
    mutateBookmarkFolders();
    if (isOpen && bookmarkFolders != null) {
      bookmarkFolders.forEach((bookmarkFolder) => {
        bookmarkFolder.bookmarks.forEach((bookmark) => {
          if (bookmark.page._id === currentPage?._id) {
            setSelectedItem(bookmarkFolder._id);
          }
        });
      });
    }
    if (!isOpen && !isBookmarked) {
      try {
        toggleBookmarkHandler();
        mutateUserBookmarks();
        mutateBookmarkInfo();
        mutatePageInfo();
        setSelectedItem(null);
      }
      catch (err) {
        toastError(err);
      }
    }
  },
  [
    isOpen,
    mutateBookmarkFolders,
    bookmarkFolders,
    isBookmarked,
    currentPage?._id,
    toggleBookmarkHandler,
    mutateUserBookmarks,
    mutateBookmarkInfo,
    mutatePageInfo,
  ]);

  const isBookmarkFolderExists = useCallback((): boolean => {
    return bookmarkFolders != null && bookmarkFolders.length > 0;
  }, [bookmarkFolders]);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string, item?: BookmarkFolderItems) => {
    try {
      await addNewFolder(folderName, item ? item._id : null);
      await mutateBookmarkFolders();
      setIsCreateAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateBookmarkFolders]);

  const onMenuItemClickHandler = useCallback(async(itemId: string) => {
    try {
      if (isBookmarked) {
        await toggleBookmarkHandler();
      }
      if (currentPage != null) {
        await addBookmarkToFolder(currentPage._id, itemId);
      }
      mutateBookmarkInfo();
      mutateUserBookmarks();
    }
    catch (err) {
      toastError(err);
    }

    mutateBookmarkFolders();
    setSelectedItem(itemId);
  }, [mutateBookmarkFolders, isBookmarked, currentPage, mutateBookmarkInfo, mutateUserBookmarks, toggleBookmarkHandler]);

  // Delete folder handler
  const onClickDeleteHandler = useCallback(async(e, item) => {
    e.stopPropagation();

    const bookmarkFolderDeleteHandler: onDeletedBookmarkFolderFunction = (folderId) => {
      if (typeof folderId !== 'string') {
        return;
      }
      mutateBookmarkInfo();
      mutateBookmarkFolders();
    };

    if (item == null) {
      return;
    }
    openDeleteBookmarkFolderModal(item, { onDeleted: bookmarkFolderDeleteHandler });
  }, [mutateBookmarkFolders, mutateBookmarkInfo, openDeleteBookmarkFolderModal]);

  const onClickChildMenuItemHandler = useCallback(async(e, item) => {
    e.stopPropagation();

    setSelectedItem(null);

    try {
      if (isBookmarked && currentPage != null) {
        await toggleBookmark(currentPage._id, isBookmarked);
      }
      if (currentPage != null) {
        await addBookmarkToFolder(currentPage._id, item._id);
      }
      mutateUserBookmarks();
      mutateBookmarkFolders();
      setSelectedItem(item._id);
      mutateBookmarkInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [isBookmarked, currentPage, mutateUserBookmarks, mutateBookmarkFolders, mutateBookmarkInfo]);


  const renderBookmarkMenuItem = (child?: BookmarkFolderItems[]) => {
    const renderSubmenu = () => {
      if (child == null || currentPage == null || bookmarkInfo == null) {
        return <></>;
      }
      return (
        <div className="bookmark-folder-submenu">
          {child.map(folder => (
            <div key={folder._id}>
              <div
                className="dropdown-item grw-bookmark-folder-menu-item"
                tabIndex={0}
                role="menuitem"
                onClick={() => onMenuItemClickHandler(folder._id)}
              >
                <BookmarkFolderMenuItem
                  item={folder}
                  isSelected={selectedItem === folder._id}
                  currentPage={currentPage}
                  onClickDeleteHandler={onClickDeleteHandler}
                  onClickChildMenuItemHandler={onClickChildMenuItemHandler}
                  onPressEnterHandlerForCreate={onPressEnterHandlerForCreate}
                />
                {isOpen && renderSubmenu()}
              </div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <>
        {isBookmarked && (
          <>
            <DropdownItem
              toggle={false}
              onClick={onUnbookmarkHandler}
              className={'grw-bookmark-folder-menu-item text-danger'}
            >
              <i className="fa fa-bookmark"></i>{' '}
              <span className="mx-2 ">
                {t('bookmark_folder.cancel_bookmark')}
              </span>
            </DropdownItem>
            <DropdownItem divider />
          </>
        )}

        {isCreateAction ? (
          <div className="mx-2">
            <BookmarkFolderNameInput
              onClickOutside={() => setIsCreateAction(false)}
              onPressEnter={onPressEnterHandlerForCreate}
            />
          </div>
        ) : (
          <DropdownItem
            toggle={false}
            onClick={onClickNewBookmarkFolder}
            className="grw-bookmark-folder-menu-item"
          >
            <FolderIcon isOpen={false} />
            <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
          </DropdownItem>
        )}

        {isBookmarkFolderExists() && currentPage != null && bookmarkInfo != null && (
          <>
            <DropdownItem divider />
            {bookmarkFolders?.map(folder => (
              <div key={folder._id}>
                <div
                  className="dropdown-item grw-bookmark-folder-menu-item"
                  tabIndex={0}
                  role="menuitem"
                  onClick={() => onMenuItemClickHandler(folder._id)}
                >
                  <BookmarkFolderMenuItem
                    item={folder}
                    isSelected={selectedItem === folder._id}
                    currentPage={currentPage}
                    onClickDeleteHandler={onClickDeleteHandler}
                    onClickChildMenuItemHandler={onClickChildMenuItemHandler}
                    onPressEnterHandlerForCreate={onPressEnterHandlerForCreate}
                  />
                  {isOpen && renderSubmenu()}
                </div>
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <UncontrolledDropdown
      onToggle={toggleHandler}
      direction={ isBookmarkFolderExists() ? 'up' : 'down' }
      className='grw-bookmark-folder-dropdown'>
      {children}
      <DropdownMenu
        right
        className='grw-bookmark-folder-menu'
        positionFixed
      >
        { renderBookmarkMenuItem() }
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};
