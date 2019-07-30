import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';
import PasswordResetDoneModal from './PasswordResetDoneModal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class PasswordResetModal extends React.Component {

  constructor() {
    super();

    this.state = {
      isOpenModal: false,
    };

    this.isShow = this.isShow.bind(this);
    this.onHide = this.onHide.bind(this);
  }

  isShow() {
    this.setState({ isOpenModal: true });
  }

  onHide() {
    this.setState({ isOpenModal: false });
  }

  render() {
    const { t, user } = this.props;

    return (
      <div>
        <div onClick={this.isShow}>
          <i className="icon-fw icon-key"></i>
          { t('user_management.reset_password') }
        </div>
        <Modal show={this.state.isOpenModal} onHide={this.onHide}>
          <Modal.Header className="modal-header" closeButton>
            <Modal.Title>
              {t('user_management.reset_password')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <p>
                { t('user_management.password_never_seen') }<br />
                <span className="text-danger">{ t('user_management.send_new_password') }</span>
              </p>
              <p>
                { t('user_management.target_user') }: <code>{ user.email }</code>
              </p>
              <PasswordResetDoneModal
                user={user}
                onHide={this.onHide}
              />
            </div>
          </Modal.Body>
        </Modal>
      </div>

    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PasswordResetModalWrapper = (props) => {
  return createSubscribedElement(PasswordResetModal, props, [AppContainer]);
};

PasswordResetModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(PasswordResetModalWrapper);
