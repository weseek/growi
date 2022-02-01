import React, { FC, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { IUserGroupHasId } from '~/interfaces/user';

type Props = {
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
      props.onClickAddButton(selectedUserGroup);
    }
  };

  return (
    <>
      <h2 className="admin-setting-header">Select a child group</h2>
      {
        (props.selectableUserGroups != null && props.selectableUserGroups.length > 0) ? (
          <>
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
                {selectedUserGroup != null ? selectedUserGroup.name : 'Select user group'}
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
              {t('Add')}
            </button>
          </>
        ) : (
          <>There are no user groups available for selection</>
        )
      }
    </>
  );
};

export default UserGroupDropdown;
