import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
} from 'reactstrap';

export const BookmarkFolderItemControl: React.FC<{
  children?: React.ReactNode
  onClickMoveToRoot?: () => Promise<void>
  onClickRename: () => void
  onClickDelete: () => void
}> = ({
  children,
  onClickMoveToRoot,
  onClickRename,
  onClickDelete,
}): JSX.Element => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
      { children ?? (
        <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control d-flex align-items-center justify-content-center">
          <i className="icon-options"></i>
        </DropdownToggle>
      ) }
      <DropdownMenu
        container="body"
        style={{ zIndex: 1055 }} /* make it larger than $zindex-modal of bootstrap */
      >
        {onClickMoveToRoot && (
          <DropdownItem
            onClick={onClickMoveToRoot}
            className="grw-page-control-dropdown-item"
          >
            <i className="fa fa-fw fa-bookmark-o grw-page-control-dropdown-icon"></i>
            {t('bookmark_folder.move_to_root')}
          </DropdownItem>
        )}
        <DropdownItem
          onClick={onClickRename}
          className="grw-page-control-dropdown-item"
        >
          <i className="icon-fw icon-action-redo grw-page-control-dropdown-icon"></i>
          {t('Rename')}
        </DropdownItem>

        <DropdownItem divider />

        <DropdownItem
          className="pt-2 grw-page-control-dropdown-item text-danger"
          onClick={onClickDelete}
        >
          <i className="icon-fw icon-trash grw-page-control-dropdown-icon"></i>
          {t('Delete')}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
