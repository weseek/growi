import React from 'react';

import {
  DropdownItem, DropdownMenu, Nav, UncontrolledDropdown,
} from 'reactstrap';

import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';


type Props ={
  item: BookmarkFolderItems
}
const BookmarkFolderSubMenu = (props: Props):JSX.Element => {
  const { item } = props;
  const { data: childFolders } = useSWRxBookamrkFolderAndChild(item._id);

  return (
    <>

      {childFolders?.map((folder) => {
        return folder.children.length > 0 ? (
          <>
            <DropdownItem >
              {folder.name}
            </DropdownItem>

            {folder.children.map(child => (
              <BookmarkFolderSubMenu key={child._id} item={child} />
            ))}
          </>
        ) : (
          <DropdownItem>
            {folder.name}
          </DropdownItem>
        );
      })}

    </>
  );
};
export default BookmarkFolderSubMenu;
