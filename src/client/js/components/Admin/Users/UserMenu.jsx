import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PasswordResetModal from './PasswordResetModal';
import StatusActivateForm from './StatusActivateForm';
import StatusSuspendedForm from './StatusSuspendedForm';
import RemoveUserForm from './UserRemoveForm';
import RemoveAdminForm from './RemoveAdminForm';
import GiveAdminForm from './GiveAdminForm';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserMenu extends React.Component {


  render() {
    const { t, user } = this.props;

    return (
      <Fragment>
        <div className="btn-group admin-user-menu">
          <button type="button" className="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown">
            <i className="icon-settings"></i> <span className="caret"></span>
          </button>
          <ul className="dropdown-menu" role="menu">
            <li className="dropdown-header">{ t('user_management.edit_menu') }</li>
            <li>
              <a onClick={this.isShow}>
                <i className="icon-fw icon-key"></i>{ t('user_management.reset_password') }
                <PasswordResetModal user={user} />
              </a>
            </li>
            <li className="divider"></li>
            <li className="dropdown-header">{ t('status') }</li>
            <li>
              {(user.status === 1 || user.status === 3) && <StatusActivateForm user={user} />}
              {user.status === 2 && <StatusSuspendedForm user={user} />}
              {(user.status === 1 || user.status === 3 || user.status === 5) && <RemoveUserForm user={user} />}
            </li>
            <li className="divider pl-0"></li>
            <li className="dropdown-header">{ t('user_management.administrator_menu') }</li>
            <li>
              {user.status === 2 && user.admin === true && <RemoveAdminForm user={user} />}
              {user.status === 2 && user.admin === false && <GiveAdminForm user={user} />}
            </li>
          </ul>
        </div>
      </Fragment>
    );
  }

}

const UserMenuWrapper = (props) => {
  return createSubscribedElement(UserMenu, props, [AppContainer]);
};

UserMenu.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(UserMenuWrapper);
