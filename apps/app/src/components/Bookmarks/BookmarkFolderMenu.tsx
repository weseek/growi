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
import { useSWRBookmarkInfo, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { useSWRxCurrentPage, useSWRxPageInfo } from '~/stores/page';

import { FolderIcon } from '../Icons/FolderIcon';

import { BookmarkFolderMenuItem } from './BookmarkFolderMenuItem';
import { BookmarkFolderNameInput } from './BookmarkFolderNameInput';


type Props = {
  children?: React.ReactNode
}

export const BookmarkFolderMenu = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { children } = props;
  const [isCreateAction, setIsCreateAction] = useState(false);
  const { data: bookmarkFolders, mutate: mutateBookmarkFolderData } = useSWRxBookamrkFolderAndChild();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: userBookmarkInfo, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);
  const { mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();
  const { mutate: mutatePageInfo } = useSWRxPageInfo(currentPage?._id);
  const isBookmarked = userBookmarkInfo?.isBookmarked ?? false;
  const [isOpen, setIsOpen] = useState(false);


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
    mutateBookmarkFolderData();
    mutatePageInfo();
    setSelectedItem(null);
  }, [mutateBookmarkFolderData, mutateBookmarkInfo, mutatePageInfo, mutateUserBookmarks, toggleBookmarkHandler]);

  const toggleHandler = useCallback(async() => {
    setIsOpen(!isOpen);
    mutateBookmarkFolderData();
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
    mutateBookmarkFolderData,
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

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await addNewFolder(folderName, null);
      await mutateBookmarkFolderData();
      setIsCreateAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateBookmarkFolderData]);

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

    mutateBookmarkFolderData();
    setSelectedItem(itemId);
  }, [mutateBookmarkFolderData, isBookmarked, currentPage, mutateBookmarkInfo, mutateUserBookmarks, toggleBookmarkHandler]);


  const renderBookmarkMenuItem = (child?: BookmarkFolderItems[]) => {
    const renderSubmenu = () => {
      if (child == null) {
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
                  onSelectedChild={() => setSelectedItem(null)}
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

        {isBookmarkFolderExists() && (
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
                    onSelectedChild={() => setSelectedItem(null)}
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
