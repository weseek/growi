import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

import { toastError } from '../../../util/apiNotification';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';

class PasswordResetModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      temporaryPassword: [],
      isPasswordResetDone: false,
    };

    this.resetPassword = this.resetPassword.bind(this);
  }

  async resetPassword() {
    const { appContainer, adminUsersContainer } = this.props;
    const user = adminUsersContainer.state.userForPasswordResetModal;

    const res = await appContainer.apiPost('/admin/users.resetPassword', { user_id: user._id });
    if (res.ok) {
      this.setState({ temporaryPassword: res.newPassword, isPasswordResetDone: true });
    }
    else {
      toastError('Failed to reset password');
    }
  }

  renderModalBodyBeforeReset() {
    const { t, adminUsersContainer } = this.props;
    const user = adminUsersContainer.state.userForPasswordResetModal;

    return (
      <div>
        <p className="alert alert-danger">{ t('user_management.password_reset_message') }</p>
        <p>
          { t('user_management.target_user') }: <code>{ user.email }</code>
        </p>
        <p>
          { t('user_management.new_password') }: <code>{ this.state.temporaryPassword }</code>
        </p>
      </div>
    );
  }

  returnModalBodyAfterReset() {
    const { t, adminUsersContainer } = this.props;
    const user = adminUsersContainer.state.userForPasswordResetModal;

    return (
      <div>
        <p>
          { t('user_management.password_never_seen') }<br />
          <span className="text-danger">{ t('user_management.send_new_password') }</span>
        </p>
        <p>
          { t('user_management.target_user') }: <code>{ user.email }</code>
        </p>
        <button type="submit" className="btn btn-primary" onClick={this.resetPassword}>
          { t('user_management.reset_password')}
        </button>
      </div>
    );
  }

  returnModalFooter() {
    return (
      <div>
        <button type="submit" className="btn btn-primary" onClick={this.props.adminUsersContainer.hidePasswordResetModal}>OK</button>
      </div>
    );
  }


  render() {
    const { t, adminUsersContainer } = this.props;

    return (
      <Modal show={adminUsersContainer.state.isPasswordResetModalShown} onHide={adminUsersContainer.hidePasswordResetModal}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            { t('user_management.reset_password') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.isPasswordResetDone ? this.renderModalBodyBeforeReset() : this.returnModalBodyAfterReset()}
        </Modal.Body>
        <Modal.Footer>
          {this.state.isPasswordResetDone && this.returnModalFooter()}
        </Modal.Footer>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PasswordResetModalWrapper = (props) => {
  return createSubscribedElement(PasswordResetModal, props, [AppContainer, AdminUsersContainer]);
};

PasswordResetModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,
};

export default withTranslation()(PasswordResetModalWrapper);
