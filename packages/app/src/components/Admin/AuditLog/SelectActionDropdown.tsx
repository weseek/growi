import React, {
  FC, useState, useCallback,
} from 'react';

import { SupportedActionType } from '~/interfaces/activity';

type Props = {
  dropdownItems: Array<{actionType: string, actionNames: SupportedActionType[]}>
  checkedItems: Map<SupportedActionType, boolean>
  onCheckItem: (action: SupportedActionType) => void
}

export const SelectActionDropdown: FC<Props> = (props: Props) => {
  const { dropdownItems, checkedItems, onCheckItem } = props;

  const [checkedAllItems, setCheckedAllItems] = useState(true);

  const handleChange = useCallback((action: SupportedActionType) => {
    onCheckItem(action);
  }, [onCheckItem]);

  return (
    <div className="btn-group mr-2 mb-3">
      <div className="dropdown">
        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
          <i className="fa fa-fw fa-bolt" />Action
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {dropdownItems.map(item => (
            <div key={item.actionType}>
              <div className="dropdown-item">
                <div className="form-group px-2 m-0">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={checkedAllItems}
                    onChange={() => setCheckedAllItems(!checkedAllItems)}
                  />
                  <label className="form-check-label">{item.actionType}</label>
                </div>
              </div>
              {
                item.actionNames.map(action => (
                  <div className="dropdown-item" key={action}>
                    <div className="form-group px-4 m-0">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`checkbox${action}`}
                        onChange={() => { handleChange(action) }}
                        checked={checkedItems.get(action)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`checkbox${action}`}
                      >
                        {action}
                      </label>
                    </div>
                  </div>
                ))
              }
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};
