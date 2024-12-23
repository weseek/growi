import React from 'react';

import { useTranslation } from 'next-i18next';
import { DropdownItem } from 'reactstrap';


export type WideViewMenuItemProps = {
  onClick: () => void,
  expandContentWidth?: boolean,
}

export const WideViewMenuItem = (props: WideViewMenuItemProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    onClick, expandContentWidth,
  } = props;

  return (
    <DropdownItem className="grw-page-control-dropdown-item dropdown-item" onClick={onClick} toggle={false}>
      <div className="form-check form-switch ms-1">
        <input
          className="form-check-input pe-none"
          type="checkbox"
          checked={expandContentWidth}
          onChange={() => {}}
        />
        <label className="form-check-label pe-none">
          { t('wide_view') }
        </label>
      </div>
    </DropdownItem>
  );
};
