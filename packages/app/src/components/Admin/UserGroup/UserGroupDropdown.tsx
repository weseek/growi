import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { IUserGroupHasId } from '~/interfaces/user';

type Props = {
  userGroups?: IUserGroupHasId[]
  selectedUserGroup?: IUserGroupHasId
  onClickDropdownButton?(): void
  onClickAddButton?(): void
};

const UserGroupDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const onClickDropdownButtonHandler = () => {
    if (props.onClickDropdownButton) {
      props.onClickDropdownButton();
    }
  };

  const onClickAddButtonHandler = () => {
    if (props.onClickAddButton) {
      props.onClickAddButton();
    }
  };

  return (
    <>
      <h2 className="admin-setting-header">Select a child group</h2>
      {
        (props.userGroups != null && props.userGroups.length > 0) ? (
          <>
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
                {props.selectedUserGroup != null ? props.selectedUserGroup.name : 'Select user group'}
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                {
                  props.userGroups.map(group => (
                    <button
                      key={group._id}
                      type="button"
                      className="dropdown-item"
                      onClick={onClickDropdownButtonHandler}
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
              onClick={onClickAddButtonHandler}
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
