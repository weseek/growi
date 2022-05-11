import React, { FC, useCallback } from 'react';

import { SupportedActionType } from '~/interfaces/activity';

type Props = {
  dropdownItems: Array<{actionCategory: string, actionNames: SupportedActionType[]}>
  actionMap: Map<SupportedActionType, boolean>
  onSelectAction: (action: SupportedActionType) => void
  onSelectMultipleAction: (actions: SupportedActionType[], isChecked: boolean) => void
}

export const SelectActionDropdown: FC<Props> = (props: Props) => {
  const {
    dropdownItems, actionMap, onSelectAction, onSelectMultipleAction,
  } = props;

  const selectActionCheckboxChangedHandler = useCallback((action) => {
    if (onSelectAction != null) {
      onSelectAction(action);
    }
  }, [onSelectAction]);

  const selectMultipleActionCheckboxChangedHandler = useCallback((actions, isChecked) => {
    if (onSelectMultipleAction != null) {
      onSelectMultipleAction(actions, isChecked);
    }
  }, [onSelectMultipleAction]);

  return (
    <div className="btn-group mr-2 mb-3">
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
                  onChange={(e) => { selectMultipleActionCheckboxChangedHandler(item.actionNames, e.target.checked) }}
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
                      onChange={() => { selectActionCheckboxChangedHandler(action) }}
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
