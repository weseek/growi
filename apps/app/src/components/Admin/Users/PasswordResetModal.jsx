import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useIsMailerSetup } from '~/stores/context';

class PasswordResetModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      temporaryPassword: [],
      isPasswordResetDone: false,
      sendEmail: false,
    };

    this.resetPassword = this.resetPassword.bind(this);
    this.onClickSendNewPasswordButton = this.onClickSendNewPasswordButton.bind(this);
  }

  async resetPassword() {
    const { t, userForPasswordResetModal } = this.props;
    try {
      const res = await apiv3Put('/users/reset-password', { id: userForPasswordResetModal._id });
      const { newPassword } = res.data;
      this.setState({ temporaryPassword: newPassword, isPasswordResetDone: true });
    }
    catch (err) {
      toastError(err);
    }
  }

  renderButtons() {
    const { t, isMailerSetup } = this.props;

    return (
      <>
        <button type="submit" className="btn btn-primary" onClick={this.onClickSendNewPasswordButton} disabled={!isMailerSetup}>
          {t('Send')}
        </button>
        <button type="submit" className="btn btn-danger" onClick={this.props.onClose}>
          {t('Close')}
        </button>
      </>
    );
  }

  renderModalBodyBeforeReset() {
    const { t, userForPasswordResetModal } = this.props;

    return (
      <>
        <p>
          {t('user_management.reset_password_modal.password_never_seen')}<br />
          <span className="text-danger">{t('user_management.reset_password_modal.send_new_password')}</span>
        </p>
        <p>
          {t('user_management.reset_password_modal.target_user')}: <code>{userForPasswordResetModal.email}</code>
        </p>
      </>
    );
  }

  returnModalBodyAfterReset() {
    const { t, userForPasswordResetModal } = this.props;
    const { temporaryPassword, showPassword } = this.state;

    const maskedPassword = showPassword
      ? temporaryPassword
      : '·'.repeat(temporaryPassword.length);

    return (
      <>
        <p className="text-danger">{t('user_management.reset_password_modal.password_reset_message')}</p>
        <p>
          {t('user_management.reset_password_modal.target_user')}: <code>{userForPasswordResetModal.email}</code>
        </p>
        <p>
          {t('user_management.reset_password_modal.new_password')}:
          <span className="masked-password ml-1"><code>{maskedPassword}</code></span>
          <button className="btn btn-link mx-2 px-1 py-0" size="sm" onClick={() => this.setState({ showPassword: !showPassword })}>
            <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
          </button>
        </p>
      </>
    );
  }

  returnModalFooterBeforeReset() {
    const { t } = this.props;
    return (
      <button type="submit" className="btn btn-danger" onClick={this.resetPassword}>
        {t('user_management.reset_password')}
      </button>
    );
  }

  returnModalFooterAfterReset() {
    const { t, isMailerSetup, userForPasswordResetModal } = this.props;

    if (!isMailerSetup) {
      return (
        <>
          <div>
            <label className="form-text text-muted" dangerouslySetInnerHTML={{ __html: t('admin:mailer_setup_required') }} />
          </div>
          {this.renderButtons()}
        </>
      );
    }
    return (
      <>
        <p className="mb-4 mt-1">To:</p>
        <div className="mr-3">
          <p className="mb-0">{userForPasswordResetModal.username}</p>
          <p className="mb-0">{userForPasswordResetModal.email}</p>
        </div>
        {this.renderButtons()}
      </>
    );
  }

  async onClickSendNewPasswordButton() {

    const {
      userForPasswordResetModal,
    } = this.props;


    try {
      const res = await apiv3Put('/users/reset-password-email', { id: userForPasswordResetModal._id, newPassword: this.state.temporaryPassword });
      const { failedToSendEmail } = res.data;
      if (failedToSendEmail == null) {
        const msg = `Email has been sent ${userForPasswordResetModal.email}`;
        toastSuccess(msg);
      }
      else {
        const msg = { message: `email: ${failedToSendEmail.email}<br>reason: ${failedToSendEmail.reason}` };
        toastError(msg);
      }
    }
    catch (err) {
      toastError(err);
    }
  }


  render() {
    const { t } = this.props;

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose}>
        <ModalHeader tag="h4" toggle={this.props.onClose} className="bg-warning text-light">
          {t('user_management.reset_password') }
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
  const { t } = useTranslation('admin');
  const { data: isMailerSetup } = useIsMailerSetup();
  return <PasswordResetModal t={t} isMailerSetup={isMailerSetup ?? false} {...props} />;
};

/**
 * Wrapper component for using unstated
 */

PasswordResetModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userForPasswordResetModal: PropTypes.object,
  onSuccessfullySentNewPasswordEmail: PropTypes.func.isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

};

export default PasswordResetModalWrapperFC;
