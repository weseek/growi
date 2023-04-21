import React, {
  useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem,
  DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip,
} from 'reactstrap';

import {
  addBookmarkToFolder, addNewFolder, hasChildren, toggleBookmark,
} from '~/client/util/bookmark-utils';
import { toastError } from '~/client/util/toastr';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { onDeletedBookmarkFolderFunction } from '~/interfaces/ui';
import { useSWRBookmarkInfo, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';
import { useBookmarkFolderDeleteModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

import { FolderIcon } from '../Icons/FolderIcon';
import { TriangleIcon } from '../Icons/TriangleIcon';

import { BookmarkFolderNameInput } from './BookmarkFolderNameInput';

type Props = {
  item: BookmarkFolderItems
  onSelectedChild: () => void
  isSelected: boolean
}
export const BookmarkFolderMenuItem = (props: Props): JSX.Element => {
  const {
    item, isSelected, onSelectedChild,
  } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: mutateBookmarkData } = useSWRxBookmarkFolderAndChild();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: userBookmarkInfo, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);
  const { open: openDeleteBookmarkFolderModal } = useBookmarkFolderDeleteModal();
  const { mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();

  const isBookmarked = userBookmarkInfo?.isBookmarked ?? false;

  const childrenExists = hasChildren(item);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await addNewFolder(folderName, item._id);
      await mutateBookmarkData();
      setIsCreateAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [item._id, mutateBookmarkData]);

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
      mutateBookmarkData();
    };

    if (item == null) {
      return;
    }
    openDeleteBookmarkFolderModal(item, { onDeleted: bookmarkFolderDeleteHandler });
  }, [item, mutateBookmarkData, mutateBookmarkInfo, openDeleteBookmarkFolderModal]);

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
      mutateBookmarkData();
      setSelectedItem(item._id);
      mutateBookmarkInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [onSelectedChild, isBookmarked, currentPage, mutateUserBookmarks, mutateBookmarkData, mutateBookmarkInfo]);

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
        <DropdownToggle
          color="transparent"
          onClick={e => e.stopPropagation()}
          onMouseEnter={onMouseEnterHandler}
        >
          {childrenExists
            ? <TriangleIcon />
            : (
              <i className="icon-plus d-block pl-0" />
            )}
        </DropdownToggle>
        {renderBookmarkSubMenuItem()}

      </UncontrolledDropdown >
      <UncontrolledTooltip
        modifiers={{ preventOverflow: { boundariesElement: 'window' } }}
        autohide={false}
        placement="top"
        target={`bookmark-delete-button-${item._id}`}
        fade={false}
      >
        {t('bookmark_folder.delete')}
      </UncontrolledTooltip>
    </>
  );
};
