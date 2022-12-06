import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, UncontrolledDropdown,
} from 'reactstrap';

import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import FolderIcon from '../Icons/FolderIcon';

import BookmarkFolderSubMenu from './BookmarkFolderSubMenu';


type Props = {
  children?: React.ReactNode
}

const BookmarkFolderDropdown = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { children } = props;
  const [isOpen, setIsOpen] = useState(false);

  const { data: bookmarkFolderData } = useSWRxBookamrkFolderAndChild();


  return (
    <Nav className="ml-auto">
      <UncontrolledDropdown nav >
        {children}
        <DropdownMenu right >
          {bookmarkFolderData?.map((folder) => {
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
        </DropdownMenu>
      </UncontrolledDropdown>
    </Nav>
  );
};

export default BookmarkFolderDropdown;
