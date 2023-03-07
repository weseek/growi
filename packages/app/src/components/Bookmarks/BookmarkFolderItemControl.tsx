import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
} from 'reactstrap';


type BookmarkFolderItemControlProps = {
  children?: React.ReactNode
  onClickRename: () => void
  onClickDelete: () => void
}
export const BookmarkFolderItemControl = (props: BookmarkFolderItemControlProps): JSX.Element => {
  const { t } = useTranslation();
  const { children, onClickRename, onClickDelete } = props;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
      { children ?? (
        <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control d-flex align-items-center justify-content-center">
          <i className="icon-options"></i>
        </DropdownToggle>
      ) }
      <DropdownMenu
        positionFixed
        modifiers={{ preventOverflow: { boundariesElement: undefined } }}
        right={true}
      >
        <DropdownItem
          onClick={onClickRename}
        >
          <i className="icon-fw icon-action-redo grw-page-control-dropdown-icon"></i>
          {t('Rename')}
        </DropdownItem>

        <DropdownItem divider/>
        <DropdownItem
          className='pt-2 grw-page-control-dropdown-item text-danger'
          onClick={onClickDelete}
        >
          <i className="icon-fw icon-trash grw-page-control-dropdown-icon"></i>
          {t('Delete')}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
