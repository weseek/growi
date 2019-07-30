import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import toastError from '../../../util/apiNotification';
import AppContainer from '../../../services/AppContainer';

class PasswordResetDoneModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isOpenThisModal: false,
      temporaryPassword: [],
    };

    this.isShow = this.isShow.bind(this);
    this.onHideDoneModal = this.onHideDoneModal.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  isShow() {
    this.setState({ isOpenThisModal: true });
  }

  onHideDoneModal() {
    this.setState({ isOpenThisModal: false });
  }

  async resetPassword() {
    const { appContainer, user } = this.props;

    const res = await appContainer.apiPost('/admin/users.resetPassword', { user_id: user._id });
    if (res.ok) {
      this.setState({ temporaryPassword: res.newPassword });
      this.setState({ isOpenThisModal: true });
    }
    else {
      toastError('Failed to reset password');
    }
  }


  render() {
    const { t, user } = this.props;

    return (
      <div>
        <button type="submit" className="btn btn-primary" onClick={this.isShow && this.resetPassword}>
          { t('user_management.reset_password')}
        </button>
        <Modal show={this.state.isOpenThisModal} onHide={this.onHideDoneModal && this.props.onHideModal}>
          <Modal.Header className="modal-header" closeButton>
            <Modal.Title>
              { t('user_management.reset_password') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <p className="alert alert-danger">{ t('user_management.password_reset_message') }</p>
              <p>
                { t('user_management.target_user') }: <code>{ user.email }</code>
              </p>
              <p>
                { t('user_management.new_password') }: <code>{ this.state.temporaryPassword }</code>
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div>
              <button type="submit" className="btn btn-primary" onClick={this.onHideDoneModal && this.props.onHideModal}>OK</button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PasswordResetDoneModalWrapper = (props) => {
  return createSubscribedElement(PasswordResetDoneModal, props, [AppContainer]);
};

PasswordResetDoneModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
  onHideModal: PropTypes.func.isRequired,
};

export default withTranslation()(PasswordResetDoneModalWrapper);
