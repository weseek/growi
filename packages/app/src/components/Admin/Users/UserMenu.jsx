import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu,
} from 'reactstrap';

import StatusActivateButton from './StatusActivateButton';
import StatusSuspendedButton from './StatusSuspendedButton';
import UserRemoveButton from './UserRemoveButton';
import RemoveAdminButton from './RemoveAdminButton';
import GiveAdminButton from './GiveAdminButton';
import SendInvitationEmailButton from './SendInvitationEmailButton';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import AdminUsersContainer from '~/client/services/AdminUsersContainer';

class UserMenu extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isInvitationEmailSended: this.props.user.isInvitationEmailSended,
    };

    this.onPasswordResetClicked = this.onPasswordResetClicked.bind(this);
    this.onSuccessfullySentInvitationEmail = this.onSuccessfullySentInvitationEmail.bind(this);
  }

  onPasswordResetClicked() {
    this.props.adminUsersContainer.showPasswordResetModal(this.props.user);
  }

  onSuccessfullySentInvitationEmail() {
    this.setState({ isInvitationEmailSended: true });
  }

  renderEditMenu() {
    const { t } = this.props;

    return (
      <Fragment>
        <li className="dropdown-divider"></li>
        <li className="dropdown-header">{t('admin:user_management.user_table.edit_menu')}</li>
        <li>
          <button className="dropdown-item" type="button" onClick={this.onPasswordResetClicked}>
            <i className="icon-fw icon-key"></i>{ t('admin:user_management.reset_password') }
          </button>
        </li>
      </Fragment>
    );
  }

  renderStatusMenu() {
    const { t, user } = this.props;
    const { isInvitationEmailSended } = this.state;

    return (
      <Fragment>
        <li className="dropdown-divider"></li>
        <li className="dropdown-header">{t('status')}</li>
        <li>
          {(user.status === 1 || user.status === 3) && <StatusActivateButton user={user} />}
          {user.status === 2 && <StatusSuspendedButton user={user} />}
          {user.status === 5 && (
            <SendInvitationEmailButton
              user={user}
              isInvitationEmailSended={isInvitationEmailSended}
              onSuccessfullySentInvitationEmail={this.onSuccessfullySentInvitationEmail}
            />
          )}
          {(user.status === 1 || user.status === 3 || user.status === 5) && <UserRemoveButton user={user} />}
        </li>
      </Fragment>
    );
  }

  renderAdminMenu() {
    const { t, user } = this.props;

    return (
      <Fragment>
        <li className="dropdown-divider pl-0"></li>
        <li className="dropdown-header">{t('admin:user_management.user_table.administrator_menu')}</li>
        <li>
          {user.admin === true && <RemoveAdminButton user={user} />}
          {user.admin === false && <GiveAdminButton user={user} />}
        </li>
      </Fragment>
    );
  }

  render() {
    const { user } = this.props;
    const { isInvitationEmailSended } = this.state;

    return (
      <UncontrolledDropdown id="userMenu" size="sm">
        <DropdownToggle caret color="secondary" outline>
          <i className="icon-settings" />
          {(user.status === 5 && !isInvitationEmailSended) && <i className="fa fa-circle text-danger grw-usermenu-notification-icon" />}
        </DropdownToggle>
        <DropdownMenu positionFixed>
          {this.renderEditMenu()}
          {user.status !== 4 && this.renderStatusMenu()}
          {user.status === 2 && this.renderAdminMenu()}
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

}

const UserMenuWrapper = withUnstatedContainers(UserMenu, [AppContainer, AdminUsersContainer]);

UserMenu.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(UserMenuWrapper);
