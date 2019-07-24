import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserMenu extends React.Component {


  render() {
    const { t } = this.props;
    const user = this.props;

    let contentOfStatus;
    if (user.status === 1) {}

    if (user.status === 2) {
    }

    if (user.status === 3) {}

    if (user.status === 1 || user.status === 5) {
      contentOfStatus = (
        <li className="dropdown-button">
          <a href="javascript:form_removeCompletely_{{ sUserId }}.submit()">
            <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
          </a>
        </li>
      );
    }

    let adminMenu;
    if (user.admin === true) {
      adminMenu = (
        <li>
          { username !== user.username
            ? (
              <li>
                <a href="javascript:form_removeFromAdmin_{{ sUserId }}.submit()">
                  <i className="icon-fw icon-user-unfollow"></i> { t('user_management.remove_admin_access') }
                </a>
              </li>
            )
            : (
              <li>
                <a disabled>
                  <i className="icon-fw icon-user-unfollow"></i> { t('user_management.remove_admin_access') }
                </a>
                <p className="alert alert-danger m-l-10 m-r-10 p-10">{ t('user_management.cannot_remove') }</p>
              </li>
            )
          }
        </li>
      );
    }


    return (
      <Fragment>
        <div className="btn-group admin-user-menu">
          <button type="button" className="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown">
            <i className="icon-settings"></i> <span className="caret"></span>
          </button>
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
                    { t('user_management.target_user') }: <code id="admin-password-reset-user"></code>
                  </p>
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
          <ul className="dropdown-menu" role="menu">
            <li className="dropdown-header">{ t('user_management.edit_menu') }</li>
            <li>
              <a
                href="#"
                data-user-id="{{ sUserId }}"
                data-user-email="{{ sUser.email }}"
                data-target="#admin-password-reset-modal"
                data-toggle="modal"
              >
                <i className="icon-fw icon-key"></i>
                { t('user_management.reset_password') }
              </a>
            </li>
            <li className="divider"></li>
            <li className="dropdown-header">{ t('status') }</li>
            <li>{contentOfStatus}</li>
            <li>{user.status === 2 && adminMenu}</li>
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

};

export default withTranslation()(UserMenuWrapper);
