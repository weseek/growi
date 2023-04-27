import React, {
  useCallback, useEffect, useState,
} from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  DropdownItem,
  DropdownMenu, DropdownToggle, UncontrolledDropdown,
} from 'reactstrap';
import type { KeyedMutator } from 'swr';

import {
  addBookmarkToFolder, addNewFolder, hasChildren, toggleBookmark,
} from '~/client/util/bookmark-utils';
import { toastError } from '~/client/util/toastr';
import { BookmarkFolderItems, IBookmarkInfo } from '~/interfaces/bookmark-info';
import { IPageHasId } from '~/interfaces/page';
import { onDeletedBookmarkFolderFunction } from '~/interfaces/ui';
import { useBookmarkFolderDeleteModal } from '~/stores/modal';

import { FolderIcon } from '../Icons/FolderIcon';
import { TriangleIcon } from '../Icons/TriangleIcon';

import { BookmarkFolderNameInput } from './BookmarkFolderNameInput';

export const BookmarkFolderMenuItem: React.FC<{
  item: BookmarkFolderItems
  isSelected: boolean
  onSelectedChild: () => void
  currentPage: IPagePopulatedToShowRevision
  bookmarkInfo: IBookmarkInfo
  mutateBookmarkFolders: KeyedMutator<BookmarkFolderItems[]>
  mutateBookmarkInfo: KeyedMutator<IBookmarkInfo>
  mutateUserBookmarks: KeyedMutator<IPageHasId[]>
}> = ({
  item,
  isSelected,
  onSelectedChild,
  currentPage,
  bookmarkInfo,
  mutateBookmarkFolders,
  mutateBookmarkInfo,
  mutateUserBookmarks,
}) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);

  const { open: openDeleteBookmarkFolderModal } = useBookmarkFolderDeleteModal();

  const isBookmarked = bookmarkInfo?.isBookmarked ?? false;

  const childrenExists = hasChildren(item);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await addNewFolder(folderName, item._id);
      await mutateBookmarkFolders();
      setIsCreateAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [item._id, mutateBookmarkFolders]);

  useEffect(() => {
    if (isOpen) {
      item.children?.forEach((bookmarkFolder) => {
        bookmarkFolder.bookmarks.forEach((bookmark) => {
          if (bookmark.page._id === currentPage?._id) {
            setSelectedItem(bookmarkFolder._id);
          }
        });
      });
    }
  }, [currentPage?._id, isOpen, item.children]);

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

  // Delete folder handler
  const onClickDeleteHandler = useCallback(async(e) => {
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
  }, [item, mutateBookmarkFolders, mutateBookmarkInfo, openDeleteBookmarkFolderModal]);

  const onClickChildMenuItemHandler = useCallback(async(e, item) => {
    e.stopPropagation();
    onSelectedChild();
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
  }, [onSelectedChild, isBookmarked, currentPage, mutateUserBookmarks, mutateBookmarkFolders, mutateBookmarkInfo]);

  const renderBookmarkSubMenuItem = useCallback(() => {
    if (!isOpen) {
      return <></>;
    }
    return (
      <DropdownMenu className='m-0'>
        {isCreateAction ? (
          <div className='mx-2' onClick={e => e.stopPropagation()}>
            <BookmarkFolderNameInput
              onClickOutside={() => setIsCreateAction(false)}
              onPressEnter={onPressEnterHandlerForCreate}
            />
          </div>
        ) : (
          <DropdownItem toggle={false} onClick={e => onClickNewBookmarkFolder(e)} className='grw-bookmark-folder-menu-item'>
            <FolderIcon isOpen={false} />
            <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
          </DropdownItem>
        )}

        {childrenExists && (<DropdownItem divider />)}

        {item.children?.map(child => (
          <div key={child._id} >
            <div
              className='dropdown-item grw-bookmark-folder-menu-item'
              tabIndex={0} role="menuitem"
              onClick={e => onClickChildMenuItemHandler(e, child)}>
              <BookmarkFolderMenuItem
                onSelectedChild={() => setSelectedItem(null)}
                item={child}
                isSelected={selectedItem === child._id}
              />
            </div>
          </div>
        ))}
      </DropdownMenu>
    );
  }, [isOpen,
      isCreateAction,
      onPressEnterHandlerForCreate,
      t,
      childrenExists,
      item.children,
      onClickNewBookmarkFolder,
      selectedItem,
      onClickChildMenuItemHandler,
  ]);

  return (
    <>
      <UncontrolledDropdown
        direction="right"
        className='d-flex justify-content-between '
        isOpen={isOpen}
        // toggle={toggleHandler}
        onMouseLeave={onMouseLeaveHandler}
      >
        <div className='d-flex justify-content-start grw-bookmark-folder-menu-item-title'>
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
          id={`bookmark-delete-button-${item._id}`}
          className="text-danger ml-auto"
          color="transparent"
          onClick={e => onClickDeleteHandler(e)}
        >
          <i className="icon-fw icon-trash grw-page-control-dropdown-icon"></i>
        </DropdownToggle>
        {/* Maximum folder hierarchy of 2 levels */}
        {item.parent == null && (
          <DropdownToggle
            color="transparent"
            onClick={e => e.stopPropagation()}
            onMouseEnter={onMouseEnterHandler}
          >
            {childrenExists
              ? <TriangleIcon />
              : <i className="icon-plus d-block pl-0" />
            }
          </DropdownToggle>
        )}
        {renderBookmarkSubMenuItem()}

      </UncontrolledDropdown >
    </>
  );
};
