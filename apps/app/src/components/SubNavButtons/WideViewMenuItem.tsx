import React from 'react';

import { useTranslation } from 'next-i18next';
import { DropdownItem } from 'reactstrap';


type WideViewMenuItemProps = {
  onClickMenuItem: (newValue: boolean) => void,
  expandContentWidth?: boolean,
}

export const WideViewMenuItem = (props: WideViewMenuItemProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    onClickMenuItem, expandContentWidth,
  } = props;

  return (
    <DropdownItem
      onClick={() => onClickMenuItem(!(expandContentWidth))}
      className="grw-page-control-dropdown-item"
    >
      <div className="form-check form-switch ms-1">
        <input
          id="switchContentWidth"
          className="form-check-input"
          type="checkbox"
          checked={expandContentWidth}
          onChange={() => {}}
        />
        <label className="form-label form-check-label" htmlFor="switchContentWidth">
          { t('wide_view') }
        </label>
      </div>
    </DropdownItem>
  );
};
