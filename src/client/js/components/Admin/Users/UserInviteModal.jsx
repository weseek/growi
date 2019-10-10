import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';

import { toastSuccess, toastError } from '../../../util/apiNotification';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';

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
        <label> { t('user_management.emails') }</label>
        <textarea
          className="form-control"
          placeholder="e.g. user@growi.org"
          style={{ height: '200px' }}
          value={this.state.emailInputValue}
          onChange={this.handleInput}
        />
        {!this.validEmail() && <p className="m-2 text-danger">{ t('user_management.valid_email') }</p>}
      </>
    );
  }

  renderCreatedModalBody() {
    const { t } = this.props;
    const { invitedEmailList } = this.state;

    return (
      <>
        <p>{t('user_management.temporary_password')}</p>
        <p>{t('user_management.send_new_password')}</p>
        {invitedEmailList.createdUserList.length > 0 && this.renderCreatedEmail(invitedEmailList.createdUserList)}
        {invitedEmailList.existingEmailList.length > 0 && this.renderExistingEmail(invitedEmailList.existingEmailList)}
      </>
    );
  }

  renderModalFooter() {
    const { t } = this.props;

    return (
      <>
        <div className="checkbox checkbox-success text-left" onChange={this.handleCheckBox} style={{ flex: 1 }}>
          <input type="checkbox" id="sendEmail" className="form-check-input" name="sendEmail" defaultChecked={this.state.sendEmail} />
          <label htmlFor="sendEmail">
            { t('user_management.invite_thru_email') }
          </label>
        </div>
        <div>
          <Button bsStyle="danger" className="fcbtn btn btn-xs btn-danger btn-outline btn-rounded" onClick={this.onToggleModal}>
          Cancel
          </Button>
          <Button
            bsStyle="primary"
            className="fcbtn btn btn-primary btn-outline btn-rounded btn-1b"
            onClick={this.handleSubmit}
            disabled={!this.validEmail()}
          >
          Done
          </Button>
        </div>
      </>
    );
  }

  renderCreatedModalFooter() {
    const { t } = this.props;

    return (
      <>
        <label className="mr-3 text-left text-danger" style={{ flex: 1 }}>
          {t('user_management.send_temporary_password')}
        </label>
        <Button
          bsStyle="primary"
          className="fcbtn btn btn-primary btn-outline btn-rounded"
          onClick={this.onToggleModal}
        >
          Close
        </Button>
      </>
    );
  }

  renderCreatedEmail(userList) {
    return (
      <ul>
        {userList.map((user) => {
          const copyText = `Email:${user.email} Password:${user.password} `;
          return (
            <CopyToClipboard text={copyText} onCopy={this.showToaster}>
              <li key={user.email} className="btn">Email: <strong className="mr-3">{user.email}</strong> Password: <strong>{user.password}</strong></li>
            </CopyToClipboard>
          );
        })}
      </ul>
    );
  }

  renderExistingEmail(emailList) {
    const { t } = this.props;

    return (
      <>
        <p className="text-warning">{ t('user_management.existing_email') }</p>
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
    const { appContainer } = this.props;

    const array = this.state.emailInputValue.split('\n');
    const emailList = array.filter((element) => { return element.match(/.+@.+\..+/) });
    const shapedEmailList = emailList.map((email) => { return email.trim() });

    try {
      const response = await appContainer.apiv3.post('/users/invite', {
        shapedEmailList,
        sendEmail: this.state.sendEmail,
      });
      this.setState({ emailInputValue: '' });
      this.setState({ invitedEmailList: response.data.emailList });
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
      <Modal show={adminUsersContainer.state.isUserInviteModalShown} onHide={this.onToggleModal}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            { t('user_management.invite_users') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {invitedEmailList == null ? this.renderModalBody()
           : this.renderCreatedModalBody()}
        </Modal.Body>
        <Modal.Footer className="d-flex">
          {invitedEmailList == null ? this.renderModalFooter()
           : this.renderCreatedModalFooter()}
        </Modal.Footer>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserInviteModalWrapper = (props) => {
  return createSubscribedElement(UserInviteModal, props, [AppContainer, AdminUsersContainer]);
};


UserInviteModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,
};

export default withTranslation()(UserInviteModalWrapper);
