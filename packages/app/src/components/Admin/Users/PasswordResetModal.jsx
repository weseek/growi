import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import AppContainer from '~/client/services/AppContainer';
import { toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';

import { withUnstatedContainers } from '../../UnstatedUtils';

class PasswordResetModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isPasswordResetDone: false,
    };

    this.resetPassword = this.resetPassword.bind(this);
  }

  async resetPassword() {
    const { t, appContainer, userForPasswordResetModal } = this.props;
    try {
      await apiv3Put('/users/reset-password', { id: userForPasswordResetModal._id });
      this.setState({ isPasswordResetDone: true });
    }
    catch (err) {
      toastError(err, t('toaster.failed_to_reset_password'));
    }
  }

  renderModalBodyBeforeReset() {
    const { t, userForPasswordResetModal } = this.props;

    return (
      <>
        <p>
          {t('admin:user_management.reset_password_modal.reset_password_info')}<br />
          <span className="text-danger">{t('admin:user_management.reset_password_modal.reset_password_alert')}</span>
        </p>
        <p>
          {t('admin:user_management.reset_password_modal.target_user')}: <code>{userForPasswordResetModal.email}</code>
        </p>
      </>
    );
  }

  returnModalBodyAfterReset() {
    const { t, userForPasswordResetModal } = this.props;

    return (
      <>
        <p className="text-danger">{t('admin:user_management.reset_password_modal.password_reset_message')}</p>
        <p>
          {t('admin:user_management.reset_password_modal.target_user')}: <code>{userForPasswordResetModal.email}</code>
        </p>
      </>
    );
  }

  returnModalFooterBeforeReset() {
    const { t } = this.props;
    return (
      <button type="submit" className="btn btn-danger" onClick={this.resetPassword}>
        {t('admin:user_management.reset_password')}
      </button>
    );
  }

  returnModalFooterAfterReset() {
    const { t } = this.props;

    return (
      <button type="submit" className="btn btn-primary" onClick={this.props.onClose}>
        {t('Close')}
      </button>
    );
  }


  render() {
    const { t } = this.props;

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose}>
        <ModalHeader tag="h4" toggle={this.props.onClose} className="bg-warning text-light">
          {t('admin:user_management.reset_password') }
        </ModalHeader>
        <ModalBody>
          {this.state.isPasswordResetDone ? this.returnModalBodyAfterReset() : this.renderModalBodyBeforeReset()}
        </ModalBody>
        <ModalFooter>
          {this.state.isPasswordResetDone ? this.returnModalFooterAfterReset() : this.returnModalFooterBeforeReset()}
        </ModalFooter>
      </Modal>
    );
  }

}

const PasswordResetModalWrapperFC = (props) => {
  const { t } = useTranslation();
  return <PasswordResetModal t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const PasswordResetModalWrapper = withUnstatedContainers(PasswordResetModalWrapperFC, [AppContainer]);

PasswordResetModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userForPasswordResetModal: PropTypes.object,

};

export default PasswordResetModalWrapper;
