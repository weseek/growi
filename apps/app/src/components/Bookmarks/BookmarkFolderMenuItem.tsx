import React, {
  useCallback, useEffect, useState,
} from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  DropdownItem,
  DropdownMenu, DropdownToggle, UncontrolledDropdown,
} from 'reactstrap';

import { hasChildren } from '~/client/util/bookmark-utils';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';

import { FolderIcon } from '../Icons/FolderIcon';
import { TriangleIcon } from '../Icons/TriangleIcon';

import { BookmarkFolderNameInput } from './BookmarkFolderNameInput';

export const BookmarkFolderMenuItem: React.FC<{
  item: BookmarkFolderItems
  isSelected: boolean
  currentPage: IPagePopulatedToShowRevision
  onClickDeleteHandler: (e: any, item: any) => Promise<void>
  onClickChildMenuItemHandler: (e: any, item: any) => Promise<void>
  onPressEnterHandlerForCreate: (folderName: string, item?: BookmarkFolderItems) => Promise<void>
}> = ({
  item,
  isSelected,
  currentPage,
  onClickDeleteHandler,
  onClickChildMenuItemHandler,
  onPressEnterHandlerForCreate,
}) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);

  const childrenExists = hasChildren(item);

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
                item={child}
                isSelected={selectedItem === child._id}
                currentPage={currentPage}
                onClickDeleteHandler={onClickDeleteHandler}
                onClickChildMenuItemHandler={onClickChildMenuItemHandler}
                onPressEnterHandlerForCreate={onPressEnterHandlerForCreate}
              />
            </div>
          </div>
        ))}
      </DropdownMenu>
    );
  }, [
    isOpen,
    isCreateAction,
    onPressEnterHandlerForCreate,
    t,
    childrenExists,
    item.children,
    onClickNewBookmarkFolder,
    selectedItem,
    currentPage,
    onClickDeleteHandler,
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
          onClick={e => onClickDeleteHandler(e, item)}
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
