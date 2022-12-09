import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem, DropdownMenu, UncontrolledDropdown,
} from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import FolderIcon from '../Icons/FolderIcon';

import BookmarkFolderMenuItem from './BookmarkFolderMenuItem';
import BookmarkFolderNameInput from './BookmarkFolderNameInput';

import styles from './BookmarkFolderMenu.module.scss';

type Props = {
  children?: React.ReactNode
  bookmarkFolders: BookmarkFolderItems[] | undefined
}

const BookmarkFolderMenu = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { children, bookmarkFolders } = props;
  const [isCreateAction, setIsCreateAction] = useState(false);
  const { mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const onClickNewBookmarkFolder = useCallback(() => {
    setIsCreateAction(true);
  }, []);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {

    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: null });
      await mutateChildBookmarkData();
      setIsCreateAction(false);
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }

  }, [mutateChildBookmarkData, t]);

  const onMenuItemClickHandler = useCallback((itemId: string) => {
    setSelectedItem(itemId);
  }, []);

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
                  onChange={e => e.stopPropagation() }
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
