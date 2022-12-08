import React, { useCallback, useEffect, useState } from 'react';

import {
  DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Button,
} from 'reactstrap';

import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import TriangleIcon from '../Icons/TriangleIcon';


type Props ={
  item: BookmarkFolderItems
}
const BookmarkFolderMenuItem = (props: Props):JSX.Element => {
  const { item } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { data: childFolders, mutate: mutateChildFolders } = useSWRxBookamrkFolderAndChild(item._id);

  useEffect(() => {
    if (isOpen) {
      mutateChildFolders();
    }
  }, [isOpen, mutateChildFolders]);

  const onMouseLeaveHandler = useCallback(() => {
    setIsOpen(false);
  }, []);
  const toggleHandler = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <UncontrolledDropdown
      direction="right"
      className='d-flex justify-content-between'
      isOpen={isOpen}
      toggle={toggleHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <Button color="transparent" className='pl-0 grw-bookmark-folder-menu-item-title'>
        {item.name}
      </Button>
      <DropdownToggle color="transparent" className='grw-bookmark-folder-menu-toggle-btn'>
        <TriangleIcon/>
      </DropdownToggle>
      { childFolders != null && (
        <DropdownMenu>
          {childFolders?.map(child => (
            <div key={child._id} >
              {child.children.length > 0 ? (
                <div className='dropdown-item grw-bookmark-folder-menu-item' tabIndex={0} role="menuitem">
                  <BookmarkFolderMenuItem item={child} />
                </div>
              ) : (
                <DropdownItem toggle={false} className='grw-bookmark-folder-menu-item'>
                  <div className='grw-bookmark-folder-menu-item-title'>
                    {child.name}
                  </div>
                </DropdownItem>
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
