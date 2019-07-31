import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PasswordResetModal from './PasswordResetModal';
import StatusActivateForm from './StatusActivateForm';
import StatusSuspendedForm from './StatusSuspendedForm';
import RemoveUserForm from './RemoveUserForm';
import RemoveAdminForm from './RemoveAdminForm';
import GiveAdminForm from './GiveAdminForm';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserMenu extends React.Component {


  render() {
    const { t, user } = this.props;

    // let contentOfStatus;
    // let adminMenu;

    // if (user.status === 1) {
    //   contentOfStatus = (
    //     <a className="mx-4" onClick={this.activateUser}>
    //       <i className="icon-fw icon-user-following"></i> { t('user_management.accept') }
    //     </a>
    //   );
    // }
    // if (user.status === 2) {
    //   contentOfStatus = (
    //     user.username !== me
    //       ? (
    //         <a onClick={this.susupendUser}>
    //           <i className="icon-fw icon-ban"></i>{ t('user_management.deactivate_account') }
    //         </a>
    //       )
    //       : (
    //         <div className="mx-4">
    //           <i className="icon-fw icon-ban mb-2"></i>{ t('user_management.deactivate_account') }
    //           <p className="alert alert-danger">{ t('user_management.your_own') }</p>
    //         </div>
    //       )
    //   );
    // }
    // if (user.status === 3) {
    //   contentOfStatus = (
    //     <div>
    //       <a className="mx-4" onClick={this.activateUser}>
    //         <i className="icon-fw icon-action-redo"></i> { t('Undo') }
    //       </a>
    //       {/* label は同じだけど、こっちは論理削除 */}
    //       <a className="mx-4" onClick={this.removeUser}>
    //         <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
    //       </a>
    //     </div>
    //   );
    // }
    // if (user.status === 1 || user.status === 5) {
    //   contentOfStatus = (
    //     <li className="dropdown-button">
    //       <a className="mx-4" onClick={this.removeUser}>
    //         <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
    //       </a>
    //     </li>
    //   );
    // }

    return (
      <Fragment>
        <div className="btn-group admin-user-menu">
          <button type="button" className="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown">
            <i className="icon-settings"></i> <span className="caret"></span>
          </button>
          <ul className="dropdown-menu" role="menu">
            <li className="dropdown-header">{ t('user_management.edit_menu') }</li>
            <li>
              <a>
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
