import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem,
  DropdownMenu, DropdownToggle, UncontrolledDropdown,
} from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { useSWRBookmarkInfo } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { useSWRxCurrentPage } from '~/stores/page';

import FolderIcon from '../Icons/FolderIcon';
import TriangleIcon from '../Icons/TriangleIcon';

import BookmarkFolderNameInput from './BookmarkFolderNameInput';


type Props ={
  item: BookmarkFolderItems
  isSelected: boolean
  onSelectedChild: () => void
}
const BookmarkFolderMenuItem = (props: Props):JSX.Element => {
  const {
    item, isSelected,
  } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: childFolders, mutate: mutateChildFolders } = useSWRxBookamrkFolderAndChild(item._id);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const { data: currentPage } = useSWRxCurrentPage();
  const { mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: item._id });
      await mutateChildFolders();
      setIsCreateAction(false);
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }

  }, [item, mutateChildFolders, t]);

  useEffect(() => {
    if (isOpen) {
      mutateChildFolders();
    }
    childFolders?.forEach((bookmarkFolder) => {
      bookmarkFolder.bookmarks.forEach((bookmark) => {
        if (bookmark.page._id === currentPage?._id) {
          setSelectedItem(bookmarkFolder._id);
        }
      });
    });

  }, [childFolders, currentPage?._id, isOpen, mutateChildFolders]);

  const onClickNewBookmarkFolder = useCallback((e) => {
    e.stopPropagation();
    setIsCreateAction(true);
  }, []);

  const onMouseLeaveHandler = useCallback(() => {
    setIsOpen(false);
    setIsCreateAction(false);
  }, []);

  const onMouseEnterHandler = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggleHandler = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const onClickChildMenuItemHandler = useCallback(async(e, item) => {
    e.stopPropagation();
    setSelectedItem(item._id);
    mutateBookmarkInfo();
    try {
      await apiv3Post('/bookmark-folder/add-boookmark-to-folder', { pageId: currentPage?._id, folderId: item._id });
      toastSuccess('Bookmark added to bookmark folder successfully');
    }
    catch (err) {
      toastError(err);
    }
  }, [currentPage, mutateBookmarkInfo]);

  const renderBookmarkSubMenuItem = useCallback(() => {
    return (
      <>
        { childFolders != null && (
          <DropdownMenu className='m-0'>
            { isCreateAction ? (
              <div className='mx-2' onClick={e => e.stopPropagation()}>
                <BookmarkFolderNameInput
                  onClickOutside={() => setIsCreateAction(false)}
                  onPressEnter={onPressEnterHandlerForCreate}
                />
              </div>
            ) : (
              <DropdownItem toggle={false} onClick={e => onClickNewBookmarkFolder(e) } className='grw-bookmark-folder-menu-item'>
                <FolderIcon isOpen={false}/>
                <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
              </DropdownItem>
            )}

            { childFolders && childFolders?.length > 0 && (<DropdownItem divider />)}

            {childFolders?.map(child => (
              <div key={child._id} >

                <div
                  className='dropdown-item grw-bookmark-folder-menu-item'
                  tabIndex={0} role="menuitem"
                  onClick={e => onClickChildMenuItemHandler(e, child)}>
                  <BookmarkFolderMenuItem
                    onSelectedChild={() => setSelectedItem(null)}
                    isSelected={selectedItem === child._id}
                    item={child}
                  />
                </div>
              </div>
            ))}
          </DropdownMenu>
        )}
      </>
    );
  }, [childFolders, isCreateAction, onClickChildMenuItemHandler, onClickNewBookmarkFolder, onPressEnterHandlerForCreate, selectedItem, t]);

  return (
    <UncontrolledDropdown
      direction="right"
      className='d-flex justify-content-between'
      isOpen={isOpen}
      toggle={toggleHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <div className='d-flex justify-content-start  grw-bookmark-folder-menu-item-title'>
        <input
          type="radio"
          checked={isSelected}
          name="bookmark-folder-menu-item"
          id={`bookmark-folder-menu-item-${item._id}`}
          onChange={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        />
        <label htmlFor={`bookmark-folder-menu-item-${item._id}`} className='p-2 m-0'>
          {item.name}
        </label>
      </div>
      <DropdownToggle
        color="transparent"
        onClick={e => e.stopPropagation()}
        onMouseEnter={onMouseEnterHandler}
      >
        { childFolders && childFolders?.length > 0 && <TriangleIcon/> }
      </DropdownToggle>
      { renderBookmarkSubMenuItem() }
    </UncontrolledDropdown >
  );
};
export default BookmarkFolderMenuItem;
