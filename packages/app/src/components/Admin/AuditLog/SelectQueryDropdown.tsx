import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';


type Props = {
  dropdownLabel: string
  dropdownItemList: string[]
  setQueryHandler: (query: string | undefined) => void
}

export const SelectQueryDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { dropdownLabel, dropdownItemList, setQueryHandler } = props;

  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);

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
          {selectedItem === undefined ? t(`admin:audit_log_management.${dropdownLabel}`) : selectedItem}
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
