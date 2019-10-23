import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
// import Modal from 'react-bootstrap/es/Modal';

import UserGroupUserFormByInput from './UserGroupUserFormByInput';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';

class UserGroupUserModal extends React.Component {

  render() {
    const { t, userGroupDetailContainer } = this.props;

    return (
      <Modal show={userGroupDetailContainer.state.isUserGroupUserModalOpen} onHide={userGroupDetailContainer.closeUserGroupUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>{ t('user_group_management.add_user') }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserGroupUserFormByInput />
        </Modal.Body>
      </Modal>
    );
  }

}

UserGroupUserModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  userGroupDetailContainer: PropTypes.instanceOf(UserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserModalWrapper = (props) => {
  return createSubscribedElement(UserGroupUserModal, props, [AppContainer, UserGroupDetailContainer]);
};

export default withTranslation()(UserGroupUserModalWrapper);
