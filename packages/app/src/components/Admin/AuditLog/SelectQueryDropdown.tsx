import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';


type SelectQueryDropdownProps = {
  dropdownLabel: string
  dropdownItemList: string[]
  setQueryHandler: (query: string) => void
}

export const SelectQueryDropdown: FC<SelectQueryDropdownProps> = (props: SelectQueryDropdownProps) => {
  const { t } = useTranslation();

  const { dropdownLabel, dropdownItemList, setQueryHandler } = props;

  const [selectedItem, setSelectedItem] = useState('');

  const onClickItemButton = useCallback((item) => {
    if (setQueryHandler == null) {
      return;
    }
    setQueryHandler(item);
    setSelectedItem(item);
  }, [setQueryHandler, setSelectedItem]);

  return (
    <div className="btn-group mr-2 mb-3">
      <div className="dropdown">
        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
          {selectedItem !== '' ? selectedItem : t(`admin:audit_log_management.${dropdownLabel}`)}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {
            dropdownItemList.map(item => (
              <button
                key={item}
                type="button"
                className="dropdown-item"
                onClick={() => onClickItemButton(item)}
              >
                {item}
              </button>
            ))
          }
        </ul>
      </div>
    </div>
  );
};
