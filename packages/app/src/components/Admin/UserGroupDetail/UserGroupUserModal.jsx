import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import AdminUserGroupDetailContainer from '~/client/services/AdminUserGroupDetailContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

import CheckBoxForSerchUserOption from './CheckBoxForSerchUserOption';
import RadioButtonForSerchUserOption from './RadioButtonForSerchUserOption';
import UserGroupUserFormByInput from './UserGroupUserFormByInput';

class UserGroupUserModal extends React.Component {

  render() {
    const {
      t, userGroup, adminUserGroupDetailContainer, onClickAddUserBtn, onSearchApplicableUsers,
    } = this.props;

    return (
      <Modal isOpen={adminUserGroupDetailContainer.state.isUserGroupUserModalOpen} toggle={adminUserGroupDetailContainer.closeUserGroupUserModal}>
        <ModalHeader tag="h4" toggle={adminUserGroupDetailContainer.closeUserGroupUserModal} className="bg-info text-light">
          {t('admin:user_group_management.add_modal.add_user') }
        </ModalHeader>
        <ModalBody>
          <p className="card well">{t('admin:user_group_management.add_modal.description')}</p>
          <div className="p-3">
            <UserGroupUserFormByInput userGroup={userGroup} onClickAddUserBtn={onClickAddUserBtn} onSearchApplicableUsers={onSearchApplicableUsers} />
          </div>
          <h2 className="border-bottom">{t('admin:user_group_management.add_modal.search_option')}</h2>
          <div className="row mt-4">
            <div className="col-6">
              <div className="mb-5">
                <CheckBoxForSerchUserOption
                  option="mail"
                  checked={adminUserGroupDetailContainer.state.isAlsoMailSearched}
                  onChange={adminUserGroupDetailContainer.switchIsAlsoMailSearched}
                />
              </div>
              <div className="mb-5">
                <CheckBoxForSerchUserOption
                  option="name"
                  checked={adminUserGroupDetailContainer.state.isAlsoNameSearched}
                  onChange={adminUserGroupDetailContainer.switchIsAlsoNameSearched}
                />
              </div>
            </div>
            <div className="col-6">
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
        </ModalBody>
      </Modal>
    );
  }

}

UserGroupUserModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminUserGroupDetailContainer: PropTypes.instanceOf(AdminUserGroupDetailContainer).isRequired,
  onClickAddUserBtn: PropTypes.func,
  onSearchApplicableUsers: PropTypes.func,
  userGroup: PropTypes.object.isRequired,
};

const UserGroupUserModalWrapperFC = (props) => {
  const { t } = useTranslation();
  return <UserGroupUserModal
    t={t}
    userGroup={props.userGroup}
    onClickAddUserBtn={props.onClickAddUserBtn}
    onSearchApplicableUsers={props.onSearchApplicableUsers}
    {...props}
  />;
};
/**
 * Wrapper component for using unstated
 */
const UserGroupUserModalWrapper = withUnstatedContainers(UserGroupUserModalWrapperFC, [AdminUserGroupDetailContainer]);

export default UserGroupUserModalWrapper;
