import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownItem, DropdownMenu,
} from 'reactstrap';

import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import FolderIcon from '../Icons/FolderIcon';


type Props = {
  children?: React.ReactNode
}
const BookmarkFolderDropdown = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { children } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { data: bookmarkFolderData } = useSWRxBookamrkFolderAndChild();

  return (
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
      { children }
      <DropdownMenu
        positionFixed
        modifiers={{ preventOverflow: { boundariesElement: undefined } }}
        right={true}
        className="rounded-0"
      >
        <DropdownItem
          onClick={() => {}}
        >
          <FolderIcon isOpen={false} />
          <span className='ml-2'>{t('bookmark_folder.new_folder')}</span>

        </DropdownItem>

        <DropdownItem divider/>
        {
          bookmarkFolderData?.map((folder) => {
            return (
              <>
                <DropdownItem
                  toggle={false}
                  key={folder._id}
                >
                  { folder.name }
                </DropdownItem>
              </>
            );
          })
        }

      </DropdownMenu>
    </Dropdown>
  );
};

export default BookmarkFolderDropdown;
