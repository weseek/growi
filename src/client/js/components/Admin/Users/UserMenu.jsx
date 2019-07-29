import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserMenu extends React.Component {


  activateUser() {
    const { appContainer } = this.props;

    appContainer.apiPost('/admin/user/{userId}/activate');
  }

  susupendUser() {
    const { appContainer } = this.props;

    appContainer.apiPost('/admin/user/{userId}/suspend');
  }

  removeUser() {
    const { appContainer } = this.props;

    appContainer.apiPost('/admin/user/{user._id}/removeCompletely');
  }

  removeFromAdmin() {
    const { appContainer } = this.props;

    appContainer.apiPost('/admin/user/{user._id}/removeFromAdmin');
  }

  giveAdminAccess() {
    const { appContainer } = this.props;

    appContainer.apiPost('/admin/user/{user._id}/makeAdmin');
  }


  render() {
    const { t, user, me } = this.props;

    const userEmail = user.email;

    let contentOfStatus;
    let adminMenu;

    if (user.status === 1) {
      contentOfStatus = (
        <a className="mx-4" onClick={this.activateUser}>
          <i className="icon-fw icon-user-following"></i> { t('user_management.accept') }
        </a>
      );
    }
    if (user.status === 2) {
      contentOfStatus = (
        user.username !== me.username
          ? (
            <a onClick={this.susupendUser}>
              <i className="icon-fw icon-ban"></i>{ t('user_management.deactivate_account') }
            </a>
          )
          : (
            <div className="mx-4">
              <i className="icon-fw icon-ban mb-2"></i>{ t('user_management.deactivate_account') }
              <p className="alert alert-danger">{ t('user_management.your_own') }</p>
            </div>
          )
      );
    }
    if (user.status === 3) {
      contentOfStatus = (
        <div>
          <a className="mx-4" onClick={this.activateUser}>
            <i className="icon-fw icon-action-redo"></i> { t('Undo') }
          </a>
          {/* label は同じだけど、こっちは論理削除 */}
          <a className="mx-4" onClick={this.removeUser}>
            <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
          </a>
        </div>
      );
    }
    if (user.status === 1 || user.status === 5) {
      contentOfStatus = (
        <li className="dropdown-button">
          <a className="mx-4" onClick={this.removeUser}>
            <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
          </a>
        </li>
      );
    }

    if (user.admin === true && user.status === 2) {
      adminMenu = (
        user.username !== me.username
          ? (
            <a onClick={this.removeFromAdmin}>
              <i className="icon-fw icon-user-unfollow mb-2"></i> { t('user_management.remove_admin_access') }
            </a>
          )
          : (
            <div className="mx-4">
              <i className="icon-fw icon-user-unfollow mb-2"></i>{ t('user_management.remove_admin_access') }
              <p className="alert alert-danger">{ t('user_management.cannot_remove') }</p>
            </div>
          )
      );
    }
    if (user.admin === false && user.status === 2) {
      adminMenu = (
        <a onClick={this.giveAdminAccess}>
          <i className="icon-fw icon-magic-wand"></i>{ t('user_management.give_admin_access') }
        </a>
      );
    }

    return (
      <Fragment>
        <div className="btn-group admin-user-menu">
          <button type="button" className="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown">
            <i className="icon-settings"></i> <span className="caret"></span>
          </button>
          <ul className="dropdown-menu" role="menu">
            <li className="dropdown-header">{ t('user_management.edit_menu') }</li>
            <li>
              <a
                href="#"
                data-user-id="{{ userId }}"
                data-target="#admin-password-reset-modal"
                data-toggle="modal"
              >
                <i className="icon-fw icon-key"></i>
                { t('user_management.reset_password') }
              </a>
            </li>
            <li className="divider"></li>
            <li className="dropdown-header">{ t('status') }</li>
            <li>
              {contentOfStatus}
            </li>
            <li className="divider pl-0"></li>
            <li className="dropdown-header">{ t('user_management.administrator_menu') }</li>
            <li>{adminMenu}</li>
          </ul>
        </div>
        {/* password reset modal */}
        <div className="modal fade" id="admin-password-reset-modal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <div className="modal-title">{ t('user_management.reset_password')}</div>
              </div>

              <div className="modal-body">
                <p>
                  { t('user_management.password_never_seen') }<br />
                  <span className="text-danger">{ t('user_management.send_new_password') }</span>
                </p>
                <p>
                  { t('user_management.target_user') }: <code>{ userEmail }</code>
                </p>
                <button type="submit" value="" className="btn btn-primary">
                  { t('user_management.reset_password')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal fade" id="admin-password-reset-modal-done">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <div className="modal-title">{ t('user_management.reset_password') }</div>
              </div>

              <div className="modal-body">
                <p className="alert alert-danger">Let the user know the new password below and strongly recommend to change another one immediately. </p>
                <p>
                Reset user: <code id="admin-password-reset-done-user"></code>
                </p>
                <p>
                New password: <code id="admin-password-reset-done-password"></code>
                </p>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" data-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
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

  user: PropTypes.array,
  me: PropTypes.array,
};

export default withTranslation()(UserMenuWrapper);
