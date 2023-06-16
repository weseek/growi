import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Tooltip,
} from 'reactstrap';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { useIsMailerSetup } from '~/stores/context';

class PasswordResetModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      temporaryPassword: '',
      isPasswordResetDone: false,
      isEmailSent: false,
      isEmailSending: false,
      showTooltip: false,
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
    const { isEmailSent, isEmailSending } = this.state;

    return (
      <>
        <button type="submit" className={`btn ${isEmailSent ? 'btn-secondary' : 'btn-primary'}`}
          onClick={isEmailSent ? undefined : this.onClickSendNewPasswordButton} disabled={!isMailerSetup || isEmailSending || isEmailSent}>
          {isEmailSent ? t('Done') : t('Send')}
        </button>
        <button type="submit" className="btn btn-danger" onClick={this.props.onClose}>
          {t('Close')}
        </button>
      </>
    );
  }

  renderAddress() {
    const { t, isMailerSetup, userForPasswordResetModal } = this.props;

    return (
      <div className="d-flex col text-left ml-1 pl-0">
        {!isMailerSetup ? (
          <label className="form-text text-muted" dangerouslySetInnerHTML={{ __html: t('admin:mailer_setup_required') }} />
        ) : (
          <>
            <p className="mr-2">To:</p>
            <div>
              <p className="mb-0">{userForPasswordResetModal.username}</p>
              <p className="mb-0">{userForPasswordResetModal.email}</p>
            </div>
          </>
        )}
      </div>
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
    const { temporaryPassword, showPassword, showTooltip } = this.state;

    const maskedPassword = showPassword
      ? temporaryPassword
      : '•'.repeat(temporaryPassword.length);

    return (
      <>
        <p className="text-danger">{t('user_management.reset_password_modal.password_reset_message')}</p>
        <p>
          {t('user_management.reset_password_modal.target_user')}: <code>{userForPasswordResetModal.email}</code>
        </p>
        <p>
          {t('user_management.reset_password_modal.new_password')}:{' '}
          <code>
            <span
              onMouseEnter={() => this.setState({ showPassword: true })}
              onMouseLeave={() => this.setState({ showPassword: false })}
            >
              {showPassword ? temporaryPassword : maskedPassword}
            </span>
          </code>
          <CopyToClipboard text={ temporaryPassword } onCopy={() => this.setState({ showTooltip: true })}>
            <button id="copy-tooltip" type="button" className="btn btn-outline-secondary border-0">
              <i className="fa fa-clone" aria-hidden="true"></i>
            </button>
          </CopyToClipboard>
          <Tooltip
            placement="right"
            isOpen={showTooltip}
            target="copy-tooltip"
            toggle={() => this.setState({ showTooltip: false })}
          >
            {t('Copied!')}
          </Tooltip>
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
    return (
      <>
        {this.renderAddress()}
        {this.renderButtons()}
      </>
    );
  }

  async onClickSendNewPasswordButton() {

    const {
      userForPasswordResetModal,
    } = this.props;

    this.setState({ isEmailSending: true });

    try {
      await apiv3Put('/users/reset-password-email', { id: userForPasswordResetModal._id, newPassword: this.state.temporaryPassword });
      this.setState({ isEmailSent: true });
    }
    catch (err) {
      this.setState({ isEmailSending: false, isEmailSent: false });
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
