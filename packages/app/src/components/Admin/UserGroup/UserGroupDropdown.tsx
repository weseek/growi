import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { IUserGroupHasId } from '~/interfaces/user';

type Props = {
  selectableUserGroups?: IUserGroupHasId[]
  onClickAddExistingUserGroupButtonHandler?(userGroup: IUserGroupHasId | null): void
  onClickCreateUserGroupButtonHandler?(): void
};

const UserGroupDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { selectableUserGroups, onClickAddExistingUserGroupButtonHandler, onClickCreateUserGroupButtonHandler } = props;

  const onClickAddExistingUserGroupButton = useCallback((userGroup: IUserGroupHasId) => {
    if (onClickAddExistingUserGroupButtonHandler != null) {
      onClickAddExistingUserGroupButtonHandler(userGroup);
    }
  }, [onClickAddExistingUserGroupButtonHandler]);

  const onClickCreateUserGroupButton = useCallback(() => {
    if (onClickCreateUserGroupButtonHandler != null) {
      onClickCreateUserGroupButtonHandler();
    }
  }, [onClickCreateUserGroupButtonHandler]);

  return (
    <>
      <div className="dropdown">
        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
          {t('admin:user_group_management.add_child_group')}
        </button>

        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">

          {
            (selectableUserGroups != null && selectableUserGroups.length > 0) && (
              <>
                {
                  selectableUserGroups.map(userGroup => (
                    <button
                      key={userGroup._id}
                      type="button"
                      className="dropdown-item"
                      onClick={() => onClickAddExistingUserGroupButton(userGroup)}
                    >
                      {userGroup.name}
                    </button>
                  ))
                }
                <div className="dropdown-divider"></div>
              </>
            )
          }

          <button
            className="dropdown-item"
            type="button"
            onClick={() => onClickCreateUserGroupButton()}
          >{t('admin:user_group_management.create_group')}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserGroupDropdown;
