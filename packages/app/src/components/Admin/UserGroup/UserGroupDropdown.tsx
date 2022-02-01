import React, { FC, useState } from 'react';

import { TFunctionResult } from 'i18next';
import { useTranslation } from 'react-i18next';

import { IUserGroupHasId } from '~/interfaces/user';

type Props = {
  headerLabel: TFunctionResult
  selectableUserGroups?: IUserGroupHasId[]
  onClickAddButton?(userGroup: IUserGroupHasId): void
};

const UserGroupDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const [selectedUserGroup, setSelectedUserGroup] = useState<IUserGroupHasId | null>(null);

  const onClickDropdownButtonHandler = (userGroup) => {
    setSelectedUserGroup(userGroup);
  };

  const onClickAddButtonHandler = () => {
    if (props.onClickAddButton && selectedUserGroup != null) {
      setSelectedUserGroup(null);
      props.onClickAddButton(selectedUserGroup);
    }
  };

  return (
    <>
      <h2 className="admin-setting-header">{props.headerLabel}</h2>
      {
        (props.selectableUserGroups != null && props.selectableUserGroups.length > 0) ? (
          <>
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
                {selectedUserGroup != null ? selectedUserGroup.name : t('admin:user_group_management.delete_modal.select_group')}
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                {
                  props.selectableUserGroups.map(group => (
                    <button
                      key={group._id}
                      type="button"
                      className="dropdown-item"
                      onClick={() => onClickDropdownButtonHandler(group)}
                    >
                      {group.name}
                    </button>
                  ))
                }
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={() => onClickAddButtonHandler()}
            >
              {t('add')}
            </button>
          </>
        ) : (
          <>{t('admin:user_group_management.no_groups_can_be_added')}</>
        )
      }
    </>
  );
};

export default UserGroupDropdown;
