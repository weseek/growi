import React, { useCallback, useEffect, useState } from 'react';

import {
  DropdownItem, DropdownMenu, DropdownToggle, Dropdown,
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

  const onMouseEnterHandler = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onMouseLeaveHandler = useCallback(() => {
    setIsOpen(false);
  }, []);
  const toggleHandler = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <Dropdown direction="right"
      onMouseOver={onMouseEnterHandler} onMouseLeave={onMouseLeaveHandler} isOpen={isOpen} toggle={toggleHandler}>
      <DropdownToggle color="transparent" className={'border-0 px-0 d-flex justify-content-between'} style={{ minWidth: '100%' }}>
        {item.name}
        <span className='pl-2'>
          <TriangleIcon/>
        </span>
      </DropdownToggle>
      { childFolders != null
          && (<DropdownMenu className='rounded-0 py-1 m-0'>
            {childFolders?.map(child => (
              <div key={child._id} >
                {child.children.length > 0 ? (
                  <div className='dropdown-item' tabIndex={0} role="menuitem">
                    <BookmarkFolderMenuItem item={child} />
                  </div>
                ) : (
                  <DropdownItem toggle={false}>
                    {child.name}
                  </DropdownItem>
                )}
              </div>
            ))}
          </DropdownMenu>
          )
      }
    </Dropdown>
  );
};
export default BookmarkFolderMenuItem;
