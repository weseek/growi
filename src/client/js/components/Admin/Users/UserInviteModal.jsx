import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { CopyToClipboard } from 'react-copy-to-clipboard';

// import Button from 'react-bootstrap/es/Button';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastSuccess, toastError } from '../../../util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUsersContainer from '../../../services/AdminUsersContainer';
// import { useIsMailerSetup } from '~/stores/context';

class UserInviteModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      emailInputValue: '',
      sendEmail: false,
      invitedEmailList: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleCheckBox = this.handleCheckBox.bind(this);
    this.onToggleModal = this.onToggleModal.bind(this);
  }

  onToggleModal() {
    this.props.adminUsersContainer.toggleUserInviteModal();
    this.setState({ invitedEmailList: null });
  }

  showToaster() {
    toastSuccess('Copied Mail and Password');
  }

  renderModalBody() {
    const { t } = this.props;

    return (
      <>
        <label>{t('admin:user_management.invite_modal.emails')}</label>
        <p>
          {t('admin:user_management.invite_modal.description1')}
          <br />
          {t('admin:user_management.invite_modal.description2')}
        </p>
        <textarea
          className="form-control"
          placeholder="e.g.&#13;&#10;user1@growi.org&#13;&#10;user2@growi.org"
          style={{ height: '200px' }}
          value={this.state.emailInputValue}
          onChange={this.handleInput}
        />
        {!this.validEmail() && <p className="m-2 text-danger">{t('admin:user_management.invite_modal.valid_email')}</p>}
      </>
    );
  }

  renderCreatedModalBody() {
    const { t } = this.props;
    const { invitedEmailList } = this.state;

    return (
      <>
        <p>{t('admin:user_management.invite_modal.temporary_password')}</p>
        <p>{t('admin:user_management.invite_modal.send_new_password')}</p>
        {invitedEmailList.createdUserList.length > 0 && this.renderCreatedEmail(invitedEmailList.createdUserList)}
        {invitedEmailList.existingEmailList.length > 0 && this.renderExistingEmail(invitedEmailList.existingEmailList)}
      </>
    );
  }

  renderModalFooter() {
    const { t } = this.props;

    // TODO GW-5729 enable useIsMailerSetup
    // const { data: isMailerSetup } = useIsMailerSetup();
    const isMailerSetup = false;

    return (
      <>
        <div className="col text-left custom-control custom-checkbox custom-checkbox-info text-left" onChange={this.handleCheckBox}>
          <input
            type="checkbox"
            id="sendEmail"
            className="custom-control-input"
            name="sendEmail"
            defaultChecked={this.state.sendEmail}
            disabled={!isMailerSetup}
          />
          <label className="custom-control-label" htmlFor="sendEmail">
            {t('admin:user_management.invite_modal.invite_thru_email')}
          </label>
          {isMailerSetup
            // eslint-disable-next-line react/no-danger
            ? <p className="form-text text-muted" dangerouslySetInnerHTML={{ __html: t('admin:user_management.invite_modal.mail_setting_link') }} />
            // eslint-disable-next-line react/no-danger
            : <p className="form-text text-muted" dangerouslySetInnerHTML={{ __html: t('admin:mailer_setup_required') }} />
          }
        </div>
        <div>
          <button
            type="button"
            className="btn btn-outline-secondary mr-2"
            onClick={this.onToggleModal}
          >
            {t('Cancel')}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleSubmit}
            disabled={!this.validEmail()}
          >
            {t('admin:user_management.invite_modal.issue')}
          </button>
        </div>
      </>
    );
  }

  renderCreatedModalFooter() {
    const { t } = this.props;

    return (
      <>
        <label className="mr-3 text-left text-danger" style={{ flex: 1 }}>
          {t('admin:user_management.invite_modal.send_temporary_password')}
        </label>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={this.onToggleModal}
        >
          {t('Close')}
        </button>
      </>
    );
  }

  renderCreatedEmail(userList) {
    return (
      <ul>
        {userList.map((user) => {
          const copyText = `Email:${user.email} Password:${user.password} `;
          return (
            <div className="my-1" key={user.email}>
              <CopyToClipboard text={copyText} onCopy={this.showToaster}>
                <li className="btn btn-outline-secondary">
                  Email: <strong className="mr-3">{user.email}</strong> Password: <strong>{user.password}</strong>
                </li>
              </CopyToClipboard>
            </div>
          );
        })}
      </ul>
    );
  }

  renderExistingEmail(emailList) {
    const { t } = this.props;

    return (
      <>
        <p className="text-warning">{t('admin:user_management.invite_modal.existing_email')}</p>
        <ul>
          {emailList.map((user) => {
            return (
              <li key={user}><strong>{user}</strong></li>
            );
          })}
        </ul>
      </>
    );
  }

  validEmail() {
    return this.state.emailInputValue.match(/.+@.+\..+/) != null;
  }

  async handleSubmit() {
    const { adminUsersContainer } = this.props;

    const array = this.state.emailInputValue.split('\n');
    const emailList = array.filter((element) => { return element.match(/.+@.+\..+/) });
    const shapedEmailList = emailList.map((email) => { return email.trim() });

    try {
      const emailList = await adminUsersContainer.createUserInvited(shapedEmailList, this.state.sendEmail);
      this.setState({ emailInputValue: '' });
      this.setState({ invitedEmailList: emailList });
      toastSuccess('Inviting user success');
    }
    catch (err) {
      toastError(err);
    }
  }

  handleInput(event) {
    this.setState({ emailInputValue: event.target.value });
  }

  handleCheckBox() {
    this.setState({ sendEmail: !this.state.sendEmail });
  }

  render() {
    const { t, adminUsersContainer } = this.props;
    const { invitedEmailList } = this.state;


    return (
      <Modal isOpen={adminUsersContainer.state.isUserInviteModalShown}>
        <ModalHeader tag="h4" toggle={this.onToggleModal} className="bg-info text-light">
          {t('admin:user_management.invite_users') }
        </ModalHeader>
        <ModalBody>
          {invitedEmailList == null ? this.renderModalBody()
           : this.renderCreatedModalBody()}
        </ModalBody>
        <ModalFooter className="d-flex">
          {invitedEmailList == null ? this.renderModalFooter()
           : this.renderCreatedModalFooter()}
        </ModalFooter>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserInviteModalWrapper = withUnstatedContainers(UserInviteModal, [AdminUsersContainer]);


UserInviteModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,
};

export default withTranslation()(UserInviteModalWrapper);
