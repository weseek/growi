import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class PasswordResetDoneModal extends React.Component {

  constructor() {
    super();

    this.state = {
      isOpenThisModal: false,
    };

    this.isShow = this.isShow.bind(this);
    this.onHideDoneModal = this.onHideDoneModal.bind(this);
  }

  isShow() {
    this.setState({ isOpenThisModal: true });
  }

  onHideDoneModal() {
    this.setState({ isOpenThisModal: false });
  }

  render() {
    const { t, user, onHide } = this.props;

    return (
      <div>
        <button type="submit" className="btn btn-primary" onClick={this.isShow}>
          { t('user_management.reset_password')}
        </button>
        <Modal show={this.state.isOpenThisModal} onHide={this.onHideDoneModal && onHide}>
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
                { t('user_management.new_password') }: <code>newPassword</code>
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div>
              <button type="submit" className="btn btn-primary" onClick={this.onHideDoneModal && onHide}>OK</button>
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
  onHide: PropTypes.func.isRequired,
};

export default withTranslation()(PasswordResetDoneModalWrapper);
