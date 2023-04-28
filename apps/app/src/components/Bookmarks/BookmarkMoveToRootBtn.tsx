import React from 'react';

import { useTranslation } from 'react-i18next';
import { DropdownItem } from 'reactstrap';

export const BookmarkMoveToRootBtn: React.FC<{
  pageId: string
  moveToRootClickedHandler: (pageId: string) => Promise<void>
}> = React.memo(({ pageId, moveToRootClickedHandler }) => {
  const { t } = useTranslation();

  return (
    <DropdownItem
      onClick={() => moveToRootClickedHandler(pageId)}
      className="grw-page-control-dropdown-item"
      data-testid="add-remove-bookmark-btn"
    >
      <i className="fa fa-fw fa-bookmark-o grw-page-control-dropdown-icon"></i>
      {t('bookmark_folder.move_to_root')}
    </DropdownItem>
  );
});
BookmarkMoveToRootBtn.displayName = 'BookmarkMoveToRootBtn';
