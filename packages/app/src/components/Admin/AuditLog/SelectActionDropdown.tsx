import React, { FC, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { SupportedActionType, SupportedActionCategoryType, SupportedActionCategory, PageActions, CommentActions, UserActions, AdminActions } from '~/interfaces/activity';

type Props = {
  actionMap: Map<SupportedActionType, boolean>
  availableActions: SupportedActionType[]
  onChangeAction: (action: SupportedActionType) => void
  onChangeMultipleAction: (actions: SupportedActionType[], isChecked: boolean) => void
}

export const SelectActionDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const {
    actionMap, availableActions, onChangeAction, onChangeMultipleAction,
  } = props;

  const dropdownItems: Array<{actionCategory: SupportedActionCategoryType, actions: SupportedActionType[]}> = [
    {
      actionCategory: SupportedActionCategory.PAGE,
      actions: PageActions.filter(action => availableActions.includes(action)),
    },
    {
      actionCategory: SupportedActionCategory.COMMENT,
      actions: CommentActions.filter(action => availableActions.includes(action)),
    },
    {
      actionCategory: SupportedActionCategory.USER,
      actions: UserActions.filter(action => availableActions.includes(action)),
    },
    {
      actionCategory: SupportedActionCategory.ADMIN,
      actions: AdminActions.filter(action => availableActions.includes(action)),
    }
  ];

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
    <div className="btn-group mr-2 admin-audit-log">
      <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
        <i className="fa fa-fw fa-bolt" />{t('admin:audit_log_management.action')}
      </button>
      <ul className="dropdown-menu select-action-dropdown" aria-labelledby="dropdownMenuButton">
        {dropdownItems.map(item => (
          <div key={item.actionCategory}>
            <div className="dropdown-item">
              <div className="form-group px-2 m-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked
                  onChange={(e) => { multipleActionCheckboxChangedHandler(item.actions, e.target.checked) }}
                />
                <label className="form-check-label">{item.actionCategory}</label>
              </div>
            </div>
            {
              item.actions.map(action => (
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
