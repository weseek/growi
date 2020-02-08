import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/es/Modal';

import UserGroupUserFormByInput from './UserGroupUserFormByInput';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUserGroupDetailContainer from '../../../services/AdminUserGroupDetailContainer';
import RadioButtonForSerchUserOption from './RadioButtonForSerchUserOption';
import CheckBoxForSerchUserOption from './CheckBoxForSerchUserOption';

class UserGroupUserModal extends React.Component {

  render() {
    const { t, adminUserGroupDetailContainer } = this.props;

    return (
      <Modal show={adminUserGroupDetailContainer.state.isUserGroupUserModalOpen} onHide={adminUserGroupDetailContainer.closeUserGroupUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('admin:user_group_management.add_modal.add_user')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-3">
            <UserGroupUserFormByInput />
          </div>
          <h2 className="border-bottom">{t('admin:user_group_management.add_modal.search_option')}</h2>
          <div className="row mt-4">
            <div className="col-xs-6">
              <div className="mb-5">
                <CheckBoxForSerchUserOption
                  option="Mail"
                  checked={adminUserGroupDetailContainer.state.isAlsoMailSearched}
                  onChange={adminUserGroupDetailContainer.switchIsAlsoMailSearched}
                />
              </div>
              <div className="mb-5">
                <CheckBoxForSerchUserOption
                  option="Name"
                  checked={adminUserGroupDetailContainer.state.isAlsoNameSearched}
                  onChange={adminUserGroupDetailContainer.switchIsAlsoNameSearched}
                />
              </div>
            </div>
            <div className="col-xs-6">
              <div className="mb-5">
                <RadioButtonForSerchUserOption
                  searchType="forward"
                  checked={adminUserGroupDetailContainer.state.searchType === 'forward'}
                  onChange={() => { adminUserGroupDetailContainer.switchSearchType('forward') }}
                />
              </div>
              <div className="mb-5">
                <RadioButtonForSerchUserOption
                  searchType="partial"
                  checked={adminUserGroupDetailContainer.state.searchType === 'partial'}
                  onChange={() => { adminUserGroupDetailContainer.switchSearchType('partial') }}
                />
              </div>
              <div className="mb-5">
                <RadioButtonForSerchUserOption
                  searchType="backward"
                  checked={adminUserGroupDetailContainer.state.searchType === 'backword'}
                  onChange={() => { adminUserGroupDetailContainer.switchSearchType('backword') }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

}

UserGroupUserModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUserGroupDetailContainer: PropTypes.instanceOf(AdminUserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserModalWrapper = (props) => {
  return createSubscribedElement(UserGroupUserModal, props, [AppContainer, AdminUserGroupDetailContainer]);
};

export default withTranslation()(UserGroupUserModalWrapper);
