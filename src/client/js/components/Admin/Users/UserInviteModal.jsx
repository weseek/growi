import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';

import { toastSuccess, toastError } from '../../../util/apiNotification';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserInviteModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      emailInputValue: '',
      sendEmail: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleCheckBox = this.handleCheckBox.bind(this);
  }

  validEmail() {
    return this.state.emailInputValue.match(/.+@.+\..+/) != null;
  }

  async handleSubmit() {
    const { appContainer } = this.props;

    const emailList = this.state.emailInputValue.split('\n');

    try {
      await appContainer.apiPost('/admin/user/invite', { emailList, sendEmail: this.state.sendEmail });
      this.props.onToggleModal();
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
    const { t } = this.props;

    return (
      <Modal show={this.props.show} onHide={this.props.onToggleModal}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            { t('user_management.invite_users') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label> { t('user_management.emails') }</label>
          <textarea
            className="form-control"
            placeholder="e.g. user@growi.org"
            style={{ height: '200px' }}
            value={this.state.emailInputValue}
            onChange={this.handleInput}
          />
          {!this.validEmail() && <p className="m-2 text-danger">{ t('user_management.valid_email') }</p>}
        </Modal.Body>
        <Modal.Footer className="d-flex">
          <label className="mr-3 text-left" style={{ flex: 1 }}>
            <input
              type="checkbox"
              defaultChecked={this.state.sendEmail}
              onChange={this.handleCheckBox}
            />
            <span className="ml-2">{ t('user_management.invite_thru_email') }</span>
          </label>
          <div>
            <Button bsStyle="danger" className="fcbtn btn btn-xs btn-danger btn-outline btn-rounded" onClick={this.props.onToggleModal}>
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
        </Modal.Footer>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserInviteModalWrapper = (props) => {
  return createSubscribedElement(UserInviteModal, props, [AppContainer]);
};


UserInviteModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  show: PropTypes.bool.isRequired,
  onToggleModal: PropTypes.func.isRequired,
};

export default withTranslation()(UserInviteModalWrapper);
