import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class ConfirmationPasswordModal extends React.Component {

  renderCreatedEmail(userList) {
    return userList.map((user) => {
      return (
        <tr key={user.email}>
          <td>
            <strong>{user.email}</strong>
          </td>
          <td>{user.password}</td>
        </tr>
      );
    });
  }

  renderExistingEmail(emailList) {
    return emailList.map((user) => {
      return (
        <p key={user}><strong>{user}</strong></p>
      );
    });
  }

  render() {
    const { t } = this.props;
    const { createdUserList, existingEmailList } = this.props.invitedEmailList;

    return (
      <Modal show={this.props.show}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            { t('user_management.invited') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{ t('user_management.temporary_password') }</p>
          <p>{ t('user_management.send_new_password') }</p>
          <p className="text-danger">{ t('user_management.send_temporary_password') }</p>
          {createdUserList && this.renderCreatedEmail(createdUserList)}
          {existingEmailList && this.renderExistingEmail(existingEmailList)}
        </Modal.Body>
        <Modal.Footer className="d-flex">
        </Modal.Footer>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ConfirmationPasswordModalWrapper = (props) => {
  return createSubscribedElement(ConfirmationPasswordModal, props, [AppContainer]);
};


ConfirmationPasswordModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  show: PropTypes.bool.isRequired,
  invitedEmailList: PropTypes.object,
};

export default withTranslation()(ConfirmationPasswordModalWrapper);
