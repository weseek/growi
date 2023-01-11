import React, {
  useCallback, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem, DropdownMenu, UncontrolledDropdown,
} from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { useSWRBookmarkInfo } from '~/stores/bookmark';
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
  const { mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);


  const onClickNewBookmarkFolder = useCallback(() => {
    setIsCreateAction(true);
  }, []);

  const toggleHandler = useCallback(() => {
    mutateBookmarkFolderData();
    bookmarkFolders?.forEach((bookmarkFolder) => {
      bookmarkFolder.bookmarks.forEach((bookmark) => {
        if (bookmark.page._id === currentPage?._id) {
          setSelectedItem(bookmarkFolder._id);
        }
      });
    });
  }, [bookmarkFolders, currentPage?._id]);

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
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }

  }, [mutateBookmarkFolderData, t]);

  const onMenuItemClickHandler = useCallback(async(itemId: string) => {
    try {
      await apiv3Post('/bookmark-folder/add-boookmark-to-folder', { pageId: currentPage?._id, folderId: itemId });

      mutateBookmarkInfo();
      toastSuccess('Bookmark added to bookmark folder successfully');
    }
    catch (err) {
      toastError(err);
    }

    mutateBookmarkFolderData();
    setSelectedItem(itemId);
  }, [currentPage?._id, mutateBookmarkFolderData, mutateBookmarkInfo]);

  const renderBookmarkMenuItem = useCallback(() => {
    return (
      <>
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
        { isBookmarkFolderExists() && (
          <>
            <DropdownItem divider />
            {bookmarkFolders?.map(folder => (
              <div key={folder._id} >
                {
                  <div className='dropdown-item grw-bookmark-folder-menu-item' tabIndex={0} role="menuitem" onClick={() => onMenuItemClickHandler(folder._id)}>
                    <BookmarkFolderMenuItem
                      item={folder}
                      isSelected={selectedItem === folder._id}
                      onSelectedChild={() => setSelectedItem(null)}
                    />
                  </div>
                }
              </div>
            ))}
          </>
        )}
      </>
    );
  }, [bookmarkFolders,
      isBookmarkFolderExists,
      isCreateAction,
      onClickNewBookmarkFolder,
      onMenuItemClickHandler,
      onPressEnterHandlerForCreate,
      t,
      selectedItem,
  ]);

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
