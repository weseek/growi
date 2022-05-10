import React, {
  FC, useState, useCallback,
} from 'react';

import { useTranslation } from 'react-i18next';

import { SupportedTargetModelType, SupportedActionType } from '~/interfaces/activity';


type DropdownProps = {
  targetModelName: SupportedTargetModelType
  actionNames: SupportedActionType[]
  checkedItems: Map<SupportedActionType, boolean>
  onCheckItem: (action: SupportedActionType) => void
}

const Dropdown: FC<DropdownProps> = (props: DropdownProps) => {

  const {
    targetModelName, actionNames, checkedItems, onCheckItem,
  } = props;

  const [checkedAllItems, setCheckedAllItems] = useState(true);

  const handleChange = useCallback((action: SupportedActionType) => {
    onCheckItem(action);
  }, [onCheckItem]);

  return (
    <>
      <div className="dropdown-item">
        <div className="form-group px-2 m-0">
          <input
            type="checkbox"
            className="form-check-input"
            checked={checkedAllItems}
            onChange={() => setCheckedAllItems(!checkedAllItems)}
          />
          <label className="form-check-label">{targetModelName}</label>
        </div>
      </div>
      {
        actionNames.map(action => (
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
    </>
  );
};


type Props = {
  dropdownItems: Array<{
    targetModelName: SupportedTargetModelType
    actionNames: SupportedActionType[]
    checkedItems: Map<SupportedActionType, boolean>
    onCheckItem: (action: SupportedActionType) => void
  }>
}

export const SelectQueryItemsDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { dropdownItems } = props;

  return (
    <div className="btn-group mr-2 mb-3">
      <div className="dropdown">
        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
          {t('admin:audit_log_management.select_action')}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {dropdownItems.map(item => (
            <div key={item.targetModelName}>
              <Dropdown
                targetModelName={item.targetModelName}
                actionNames={item.actionNames}
                checkedItems={item.checkedItems}
                onCheckItem={item.onCheckItem}
              />
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};
