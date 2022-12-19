import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem, DropdownMenu, UncontrolledDropdown,
} from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { useSWRxCurrentPage } from '~/stores/page';

import FolderIcon from '../Icons/FolderIcon';

import BookmarkFolderMenuItem from './BookmarkFolderMenuItem';
import BookmarkFolderNameInput from './BookmarkFolderNameInput';

import styles from './BookmarkFolderMenu.module.scss';

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

  const onClickNewBookmarkFolder = useCallback(() => {
    setIsCreateAction(true);
  }, []);

  useEffect(() => {
    bookmarkFolders?.forEach((bookmarkFolder) => {
      const bookmark = bookmarkFolder.bookmarks.filter((bookmark) => {
        return bookmark.page._id === currentPage?._id;
      });
      if (bookmark != null && bookmark.length > 0) {
        setSelectedItem(bookmarkFolder._id);
      }
    });
  }, [bookmarkFolders, currentPage, mutateBookmarkFolderData]);

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
      setSelectedItem(itemId);
      toastSuccess('Bookmark added to bookmark folder successfully');

    }
    catch (err) {
      toastError(err);
    }
  }, [currentPage]);

  return (
    <UncontrolledDropdown className={`grw-bookmark-folder-dropdown ${styles['grw-bookmark-folder-dropdown']}`}>
      {children}
      <DropdownMenu right className='grw-bookmark-folder-menu'>
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
        <DropdownItem divider />
        {bookmarkFolders?.map(folder => (
          <div key={folder._id} >
            { folder.children.length > 0 ? (
              <div className='dropdown-item grw-bookmark-folder-menu-item' tabIndex={0} role="menuitem" onClick={() => onMenuItemClickHandler(folder._id)}>
                <BookmarkFolderMenuItem
                  isSelected={selectedItem === folder._id}
                  item={folder}
                  onSelectedChild={() => setSelectedItem(null)}
                />
              </div>
            ) : (
              <div className='dropdown-item grw-bookmark-folder-menu-item' tabIndex={0} role="menuitem" onClick={() => onMenuItemClickHandler(folder._id)}>
                <input
                  type="radio"
                  checked={selectedItem === folder._id}
                  name="bookmark-folder-menu-item"
                  id={`bookmark-folder-menu-item-${folder._id}`}
                  onChange={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                />
                <label htmlFor={`bookmark-folder-menu-item-${folder._id}`} className='p-2 m-0 grw-bookmark-folder-menu-item-title mr-auto'>
                  {folder.name}
                </label>
              </div>
            )}
          </div>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default BookmarkFolderMenu;
