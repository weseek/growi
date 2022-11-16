import React, { useState } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu,
} from 'reactstrap';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

import GiveAdminButton from './GiveAdminButton';
import RemoveAdminMenuItem from './RemoveAdminMenuItem';
import SendInvitationEmailButton from './SendInvitationEmailButton';
import StatusActivateButton from './StatusActivateButton';
import StatusSuspendedMenuItem from './StatusSuspendMenuItem';
import UserRemoveButton from './UserRemoveButton';

import styles from './UserMenu.module.scss';

type UserMenuProps = {
  adminUsersContainer: AdminUsersContainer,
  user: IUserHasId,
}

const UserMenu = (props: UserMenuProps) => {
  const { t } = useTranslation('admin');

  const { adminUsersContainer, user } = props;

  const [isInvitationEmailSended, setIsInvitationEmailSended] = useState<boolean>(user.isInvitationEmailSended);

  const onClickPasswordResetHandler = async() => {
    await adminUsersContainer.showPasswordResetModal(user);
  };

  const onSuccessfullySentInvitationEmailHandler = () => {
    setIsInvitationEmailSended(true);
  };

  const renderEditMenu = () => {
    return (
      <>
        <li className="dropdown-divider"></li>
        <li className="dropdown-header">{t('user_management.user_table.edit_menu')}</li>
        <li>
          <button className="dropdown-item" type="button" onClick={onClickPasswordResetHandler}>
            <i className="icon-fw icon-key"></i>{ t('user_management.reset_password') }
          </button>
        </li>
      </>
    );
  };

  const renderStatusMenu = () => {
    return (
      <>
        <li className="dropdown-divider"></li>
        <li className="dropdown-header">{t('user_management.status')}</li>
        <li>
          {(user.status === 1 || user.status === 3) && <StatusActivateButton user={user} />}
          {user.status === 2 && <StatusSuspendedMenuItem user={user} />}
          {user.status === 5 && (
            <SendInvitationEmailButton
              user={user}
              isInvitationEmailSended={isInvitationEmailSended}
              onSuccessfullySentInvitationEmail={onSuccessfullySentInvitationEmailHandler}
            />
          )}
          {(user.status === 1 || user.status === 3 || user.status === 5) && <UserRemoveButton user={user} />}
        </li>
      </>
    );
  };

  const renderAdminMenu = () => {
    return (
      <>
        <li className="dropdown-divider pl-0"></li>
        <li className="dropdown-header">{t('user_management.user_table.administrator_menu')}</li>
        <li>
          {user.admin === true && <RemoveAdminMenuItem user={user} />}
          {user.admin === false && <GiveAdminButton user={user} />}
        </li>
      </>
    );
  };

  return (
    <UncontrolledDropdown id="userMenu" size="sm">
      <DropdownToggle caret color="secondary" outline>
        <i className="icon-settings" />
        {(user.status === 5 && !isInvitationEmailSended)
        && <i className={`fa fa-circle text-danger grw-usermenu-notification-icon ${styles['grw-usermenu-notification-icon']}`} />}
      </DropdownToggle>
      <DropdownMenu positionFixed>
        {renderEditMenu()}
        {user.status !== 4 && renderStatusMenu()}
        {user.status === 2 && renderAdminMenu()}
      </DropdownMenu>
    </UncontrolledDropdown>
  );

};

/**
* Wrapper component for using unstated
*/
// eslint-disable-next-line max-len
const UserMenuWrapper: React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & React.RefAttributes<any>> = withUnstatedContainers(UserMenu, [AdminUsersContainer]);

export default UserMenuWrapper;
