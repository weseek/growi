import React, {
  useCallback, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem, DropdownMenu, UncontrolledDropdown,
} from 'reactstrap';

import { apiv3Post, apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { useSWRBookmarkInfo, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { useSWRxCurrentPage } from '~/stores/page';

import FolderIcon from '../Icons/FolderIcon';

import BookmarkFolderMenuItem from './BookmarkFolderMenuItem';
import BookmarkFolderNameInput from './BookmarkFolderNameInput';


type Props = {
  children?: React.ReactNode
}

const BookmarkFolderMenu = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { children } = props;
  const [isCreateAction, setIsCreateAction] = useState(false);
  const { data: bookmarkFolders, mutate: mutateBookmarkFolderData } = useSWRxBookamrkFolderAndChild();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: userBookmarkInfo, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);
  const { mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();
  const isBookmarked = userBookmarkInfo?.isBookmarked;
  const [isOpen, setIsOpen] = useState(false);

  const toggleBookmarkHandler = useCallback(async() => {

    try {
      await apiv3Put('/bookmark-folder/update-bookmark', { pageId: currentPage?._id, status: isBookmarked });
      toastSuccess(t('toaster.add_succeeded', { target: t('bookmark_folder.bookmark'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }

    mutateUserBookmarks();
    mutateBookmarkInfo();
    setSelectedItem(null);
    mutateBookmarkFolderData();
  }, [currentPage, isBookmarked, mutateBookmarkFolderData, mutateBookmarkInfo, mutateUserBookmarks, t]);


  const onClickNewBookmarkFolder = useCallback(() => {
    setIsCreateAction(true);
  }, []);


  const toggleHandler = useCallback(() => {
    setIsOpen(!isOpen);
    mutateBookmarkFolderData();
    if (isOpen && bookmarkFolders != null) {
      bookmarkFolders?.forEach((bookmarkFolder) => {
        bookmarkFolder.bookmarks.forEach((bookmark) => {
          if (bookmark.page._id === currentPage?._id) {
            if (bookmark.page._id === currentPage?._id) {
              setSelectedItem(bookmarkFolder._id);
            }
          }
        });
      });
    }
  }, [bookmarkFolders, currentPage?._id, isOpen, mutateBookmarkFolderData]);


  const isBookmarkFolderExists = useCallback((): boolean => {
    if (bookmarkFolders && bookmarkFolders.length > 0) {
      return true;
    }
    return false;
  }, [bookmarkFolders]);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: null });
      await mutateBookmarkFolderData();
      setIsCreateAction(false);
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }

  }, [mutateBookmarkFolderData, t]);

  const onMenuItemClickHandler = useCallback(async(itemId: string) => {
    try {
      // Remove from root folder then move to selected folder
      if (isBookmarked) {
        await toggleBookmarkHandler();
        await apiv3Post('/bookmark-folder/add-boookmark-to-folder', { pageId: currentPage?._id, folderId: itemId });
      }
      // Move to selected folder
      else {
        await apiv3Post('/bookmark-folder/add-boookmark-to-folder', { pageId: currentPage?._id, folderId: itemId });
        mutateBookmarkInfo();
        toastSuccess(t('toaster.add_succeeded', { target: t('bookmark_folder.bookmark'), ns: 'commons' }));
      }
    }
    catch (err) {
      toastError(err);
    }

    mutateBookmarkFolderData();
    setSelectedItem(itemId);
  }, [currentPage?._id, isBookmarked, mutateBookmarkFolderData, mutateBookmarkInfo, t, toggleBookmarkHandler]);


  const renderBookmarkMenuItem = (child ?:BookmarkFolderItems[]) => {
    if (!child) {
      return (
        <>
          <DropdownItem toggle={false} onClick={toggleBookmarkHandler} className={`grw-bookmark-folder-menu-item ${isBookmarked ? 'text-danger' : ''}`}>
            <i className="fa fa-bookmark"></i> <span className="mx-2 ">
              { isBookmarked ? t('bookmark_folder.cancel_bookmark') : t('bookmark_folder.bookmark_this_page')}
            </span>
          </DropdownItem>
          <DropdownItem divider />
          { isCreateAction ? (
            <div className='mx-2'>
              <BookmarkFolderNameInput
                onClickOutside={() => setIsCreateAction(false)}
                onPressEnter={onPressEnterHandlerForCreate}
              />
            </div>
          ) : (
            <DropdownItem toggle={false} onClick={onClickNewBookmarkFolder} className='grw-bookmark-folder-menu-item'>
              <FolderIcon isOpen={false}/>
              <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
            </DropdownItem>
          )}
          {isBookmarkFolderExists() && (
            <>
              <DropdownItem divider />
              {bookmarkFolders?.map(folder => (
                <div key={folder._id}>
                  <div className='dropdown-item grw-bookmark-folder-menu-item' tabIndex={0} role="menuitem" onClick={() => onMenuItemClickHandler(folder._id)}>
                    <BookmarkFolderMenuItem
                      item={folder}
                      isSelected={selectedItem === folder._id}
                      onSelectedChild={() => setSelectedItem(null)}
                    />
                    {isOpen && (
                      <div className="bookmark-folder-submenu">
                        {renderBookmarkMenuItem(folder.children)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      );
    }
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

export default BookmarkFolderMenu;
