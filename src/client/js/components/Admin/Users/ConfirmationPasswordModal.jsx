import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class ConfirmationPasswordModal extends React.Component {

  render() {
    const { t } = this.props;

    const renderCreatedEmail = () => {
      return <p>helllo</p>;
    };

    const renderExistedEmail = () => {
      return <p>helllo</p>;
    };

    return (
      <Modal show={this.props.show} onHide={this.props.onToggleModal}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            { t('user_management.invited') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{ t('user_management.temporary_password') }</p>
          <p>{ t('user_management.send_new_password') }</p>
          <p className="text-danger">{ t('user_management.send_temporary_password') }</p>
          {/* {this.props.invitedEmailList.map((email) => {
              return (
                <tr key={email._id}>
                  <td>
                    <strong>{email}</strong>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{dateFnsFormat(new Date(user.createdAt), 'YYYY-MM-DD')}</td>
                  <td>
                    { user.lastLoginAt && <span>{dateFnsFormat(new Date(user.lastLoginAt), 'YYYY-MM-DD HH:mm')}</span> }
                  </td>
                  <td>
                    <UserMenu user={user} onPasswordResetClicked={this.props.onPasswordResetClicked} />
                  </td>
                </tr>
              );
            })} */}
          {renderCreatedEmail()}
          {renderExistedEmail()}
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
  onToggleModal: PropTypes.func.isRequired,
};

export default withTranslation()(ConfirmationPasswordModalWrapper);
