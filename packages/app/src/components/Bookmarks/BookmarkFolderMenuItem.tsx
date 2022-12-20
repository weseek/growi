import React, { useCallback, useEffect, useState } from 'react';

import {
  DropdownMenu, DropdownToggle, UncontrolledDropdown,
} from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { useSWRxCurrentPage } from '~/stores/page';

import TriangleIcon from '../Icons/TriangleIcon';


type Props ={
  item: BookmarkFolderItems
  isSelected: boolean
  onSelectedChild: () => void
}
const BookmarkFolderMenuItem = (props: Props):JSX.Element => {
  const {
    item, isSelected, onSelectedChild,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { data: childFolders, mutate: mutateChildFolders } = useSWRxBookamrkFolderAndChild(item._id);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { data: currentPage } = useSWRxCurrentPage();

  const getSelectedFolder = useCallback(async() => {
    try {
      const result = await apiv3Get(`/bookmark-folder/selected-bookmark-folder/${currentPage?._id}`);
      const { selectedFolder } = result.data;
      if (selectedFolder != null) {
        setSelectedItem(selectedFolder._id);
      }
    }
    catch (err) {
      toastError(err);
    }
  }, [currentPage]);

  useEffect(() => {
    if (isOpen) {
      mutateChildFolders();
      getSelectedFolder();
    }
  }, [getSelectedFolder, isOpen, mutateChildFolders]);

  const onMouseLeaveHandler = useCallback(() => {
    setIsOpen(false);
  }, []);
  const toggleHandler = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const onClickChildMenuItemHandler = useCallback(async(e, item) => {
    e.stopPropagation();
    setSelectedItem(item._id);
    try {
      await apiv3Post('/bookmark-folder/add-boookmark-to-folder', { pageId: currentPage?._id, folderId: item._id });
      toastSuccess('Bookmark added to bookmark folder successfully');
    }
    catch (err) {
      toastError(err);
    }
    onSelectedChild();
  }, [currentPage, onSelectedChild]);

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
      <DropdownToggle color="transparent" className='grw-bookmark-folder-menu-toggle-btn ' onClick={e => e.stopPropagation()}>
        <TriangleIcon/>
      </DropdownToggle>
      { childFolders != null && (
        <DropdownMenu className='m-0'>
          {childFolders?.map(child => (
            <div key={child._id} >
              {child.children.length > 0 ? (
                <div className='dropdown-item grw-bookmark-folder-menu-item' tabIndex={0} role="menuitem" onClick={e => onClickChildMenuItemHandler(e, child)}>
                  <BookmarkFolderMenuItem
                    onSelectedChild={() => setSelectedItem(null)}
                    isSelected={selectedItem === child._id}
                    item={child}
                  />
                </div>
              ) : (
                <div className='dropdown-item grw-bookmark-folder-menu-item' tabIndex={0} role="menuitem" onClick={e => onClickChildMenuItemHandler(e, child)}>
                  <input
                    type="radio"
                    checked={selectedItem === child._id}
                    name="bookmark-folder-menu-item"
                    id={`bookmark-folder-menu-item-${child._id}`}
                    onChange={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation() }
                  />
                  <label htmlFor={`bookmark-folder-menu-item-${child._id}`} className='p-2 m-0 grw-bookmark-folder-menu-item-title mr-auto'>
                    {child.name}
                  </label>
                </div>
              )}
            </div>
          ))}
        </DropdownMenu>
      )
      }
    </UncontrolledDropdown >
  );
};
export default BookmarkFolderMenuItem;
