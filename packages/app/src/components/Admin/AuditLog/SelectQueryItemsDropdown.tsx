import React, {
  FC, useState, useCallback, useEffect,
} from 'react';

import { useTranslation } from 'react-i18next';


type Props = {
  dropdownLabel: string
  dropdownItemList: string[]
  onCheckItem: (items: string[]) => void
}

export const SelectQueryItemsDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { dropdownLabel, dropdownItemList, onCheckItem } = props;

  const [checkedItems, setCheckedItems] = useState<string[]>(dropdownItemList);

  const handleChange = useCallback((checkedItem: string) => {
    setCheckedItems(
      checkedItems.includes(checkedItem)
        ? checkedItems.filter(item => item !== checkedItem)
        : [...checkedItems, checkedItem],
    );
  }, [checkedItems]);

  useEffect(() => {
    if (onCheckItem != null) {
      onCheckItem(checkedItems);
    }
  }, [onCheckItem, checkedItems]);

  return (
    <div className="btn-group mr-2 mb-3">
      <div className="dropdown">
        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
          {t(`admin:audit_log_management.${dropdownLabel}`)}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <div className="dropdown-item">
            <div className="form-group px-2 m-0">
              <input type="checkbox" className="form-check-input" />
              <label className="form-check-label">Page</label>
            </div>
          </div>
          {
            dropdownItemList.map(item => (
              <div className="dropdown-item" key={item}>
                <div className="form-group px-4 m-0">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`checkbox${item}`}
                    onChange={() => { handleChange(item) }}
                    checked={checkedItems.includes(item)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`checkbox${item}`}
                  >
                    {item}
                  </label>
                </div>
              </div>
            ))
          }
        </ul>
      </div>
    </div>
  );
};
