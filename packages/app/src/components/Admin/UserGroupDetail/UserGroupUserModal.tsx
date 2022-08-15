import React from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import AdminUserGroupDetailContainer from '~/client/services/AdminUserGroupDetailContainer';
import { IUserGroupHasId } from '~/interfaces/user';
import { SearchTypes, SearchType } from '~/interfaces/user-group';


import { withUnstatedContainers } from '../../UnstatedUtils';

import CheckBoxForSerchUserOption from './CheckBoxForSerchUserOption';
import RadioButtonForSerchUserOption from './RadioButtonForSerchUserOption';
import UserGroupUserFormByInput from './UserGroupUserFormByInput';

type Props = {
  adminUserGroupDetailContainer: AdminUserGroupDetailContainer,
  userGroup: IUserGroupHasId,
  searchType: SearchType,
  onClickAddUserBtn: () => void,
  onSearchApplicableUsers: () => void,
  onChangeSearchType: (searchType: SearchType) => void
}

const UserGroupUserModal = (props: Props) => {
  const { t } = useTranslation();
  const {
    adminUserGroupDetailContainer, userGroup, searchType, onClickAddUserBtn, onSearchApplicableUsers, onChangeSearchType,
  } = props;

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
                checked={searchType === SearchTypes.FORWARD}
                onChange={() => onChangeSearchType(SearchTypes.FORWARD)}
              />
            </div>
            <div className="mb-5">
              <RadioButtonForSerchUserOption
                searchType="partial"
                checked={searchType === SearchTypes.PARTIAL}
                onChange={() => onChangeSearchType(SearchTypes.PARTIAL)}
              />
            </div>
            <div className="mb-5">
              <RadioButtonForSerchUserOption
                searchType="backward"
                checked={searchType === SearchTypes.BACKWORD}
                onChange={() => onChangeSearchType(SearchTypes.BACKWORD)}
              />
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserModalWrapper = withUnstatedContainers(UserGroupUserModal, [AdminUserGroupDetailContainer]);

export default UserGroupUserModalWrapper;
