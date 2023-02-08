import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem,
  DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip,
} from 'reactstrap';

import { apiv3Delete, apiv3Post } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { useSWRBookmarkInfo } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { useSWRxCurrentPage } from '~/stores/page';

import FolderIcon from '../Icons/FolderIcon';
import TriangleIcon from '../Icons/TriangleIcon';

import BookmarkFolderNameInput from './BookmarkFolderNameInput';


type Props = {
  item: BookmarkFolderItems
  onSelectedChild: () => void
  isSelected: boolean
}
const BookmarkFolderMenuItem = (props: Props): JSX.Element => {
  const {
    item, isSelected, onSelectedChild,
  } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentChildFolders, setCurrentChildFolders] = useState<BookmarkFolderItems[]>();
  const { data: childFolders, mutate: mutateChildFolders } = useSWRxBookamrkFolderAndChild(item._id);
  const { mutate: mutateParentFolders } = useSWRxBookamrkFolderAndChild(item.parent);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const { data: currentPage } = useSWRxCurrentPage();
  const { mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: item._id });
      await mutateChildFolders();
      setIsCreateAction(false);
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }

  }, [item, mutateChildFolders, t]);


  useEffect(() => {
    if (isOpen && childFolders != null) {
      mutateChildFolders();
      setCurrentChildFolders(childFolders);
    }
    currentChildFolders?.forEach((bookmarkFolder) => {
      bookmarkFolder.bookmarks.forEach((bookmark) => {
        if (bookmark.page._id === currentPage?._id) {
          setSelectedItem(bookmarkFolder._id);
        }
      });
    });

  }, [childFolders, currentChildFolders, currentPage?._id, isOpen, item, mutateChildFolders, mutateParentFolders]);

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
  const onClickDeleteHandler = useCallback(async(e, item) => {
    e.stopPropagation();
    try {
      await apiv3Delete(`/bookmark-folder/${item._id}`);
      mutateParentFolders();
      mutateBookmarkInfo();
      setIsOpen(false);
      toastSuccess(t('toaster.delete_succeeded', { target: t('bookmark_folder.bookmark_folder'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateBookmarkInfo, mutateParentFolders, t]);

  const onClickChildMenuItemHandler = useCallback(async(e, item) => {
    e.stopPropagation();
    mutateBookmarkInfo();
    onSelectedChild();
    try {
      await apiv3Post('/bookmark-folder/add-boookmark-to-folder', { pageId: currentPage?._id, folderId: item._id });
      toastSuccess(t('toaster.add_succeeded', { target: t('bookmark_folder.bookmark'), ns: 'commons' }));
      mutateParentFolders();
      mutateChildFolders();
      setSelectedItem(item._id);
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateBookmarkInfo, onSelectedChild, currentPage?._id, mutateParentFolders, mutateChildFolders, t]);

  const renderBookmarkSubMenuItem = useCallback(() => {
    return (
      <>
        {childFolders != null && (
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

            {currentChildFolders && currentChildFolders?.length > 0 && (<DropdownItem divider />)}

            {currentChildFolders?.map(child => (
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
        )}
      </>
    );
  }, [childFolders, currentChildFolders, isCreateAction, onClickChildMenuItemHandler, onClickNewBookmarkFolder, onPressEnterHandlerForCreate, selectedItem, t]);

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
        <DropdownToggle
          color="transparent"
          onClick={e => e.stopPropagation()}
          onMouseEnter={onMouseEnterHandler}
        >
          {childFolders && childFolders?.length > 0
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

export default BookmarkFolderMenuItem;
