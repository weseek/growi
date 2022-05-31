import React, { FC, useCallback } from 'react';

import { SupportedActionType } from '~/interfaces/activity';

type Props = {
  dropdownItems: Array<{actionCategory: string, actionNames: SupportedActionType[]}>
  actionMap: Map<SupportedActionType, boolean>
  onChangeAction: (action: SupportedActionType) => void
  onChangeMultipleAction: (actions: SupportedActionType[], isChecked: boolean) => void
}

export const SelectActionDropdown: FC<Props> = (props: Props) => {
  const {
    dropdownItems, actionMap, onChangeAction, onChangeMultipleAction,
  } = props;

  const actionCheckboxChangedHandler = useCallback((action) => {
    if (onChangeAction != null) {
      onChangeAction(action);
    }
  }, [onChangeAction]);

  const multipleActionCheckboxChangedHandler = useCallback((actions, isChecked) => {
    if (onChangeMultipleAction != null) {
      onChangeMultipleAction(actions, isChecked);
    }
  }, [onChangeMultipleAction]);

  return (
    <div className="btn-group mr-2">
      <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
        <i className="fa fa-fw fa-bolt" />Action
      </button>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
        {dropdownItems.map(item => (
          <div key={item.actionCategory}>
            <div className="dropdown-item">
              <div className="form-group px-2 m-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked
                  onChange={(e) => { multipleActionCheckboxChangedHandler(item.actionNames, e.target.checked) }}
                />
                <label className="form-check-label">{item.actionCategory}</label>
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
                      onChange={() => { actionCheckboxChangedHandler(action) }}
                      checked={actionMap.get(action)}
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
  );
};
