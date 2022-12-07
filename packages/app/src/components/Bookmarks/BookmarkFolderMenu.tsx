import React from 'react';

import { useTranslation } from 'next-i18next';
import {
  DropdownItem, DropdownMenu, UncontrolledDropdown,
} from 'reactstrap';

import { BookmarkFolderItems } from '~/interfaces/bookmark-info';

import FolderIcon from '../Icons/FolderIcon';

import BookmarkFolderMenuItem from './BookmarkFolderMenuItem';


type Props = {
  children?: React.ReactNode
  bookmarkFolders: BookmarkFolderItems[] | undefined
}

const BookmarkFolderMenu = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { children, bookmarkFolders } = props;

  return (
    <UncontrolledDropdown >
      {children}
      <DropdownMenu right className='rounded-0'>
        <DropdownItem toggle={false}>
          <FolderIcon isOpen={false}/>
          <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
        </DropdownItem>
        <DropdownItem divider />
        {bookmarkFolders?.map(folder => (
          <div key={folder._id} >
            { folder.children.length > 0 ? (
              <div className='dropdown-item' tabIndex={0} role="menuitem">
                <BookmarkFolderMenuItem item={folder} />
              </div>
            ) : (
              <DropdownItem toggle={false}>
                {folder.name}
              </DropdownItem>
            )}
          </div>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>

  );
};

export default BookmarkFolderMenu;
