import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';


type Props = {
  dropdownLabel: string
  dropdownItemList: string[]
  onSetQuery: (query: string | undefined) => void
}

export const SelectQueryDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { dropdownLabel, dropdownItemList, onSetQuery } = props;

  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);

  const onClickItemButton = useCallback((item) => {
    if (onSetQuery == null) {
      return;
    }
    onSetQuery(item);
    setSelectedItem(item);
  }, [onSetQuery, setSelectedItem]);

  return (
    <div className="btn-group mr-2 mb-3">
      <div className="dropdown">
        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
          {selectedItem === undefined ? t(`admin:audit_log_management.${dropdownLabel}`) : selectedItem}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <button
            type="button"
            className="dropdown-item"
            onClick={() => onClickItemButton(undefined)}
          >
            {t('admin:audit_log_management.unassigned')}
          </button>
          <div className="dropdown-divider"></div>
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
