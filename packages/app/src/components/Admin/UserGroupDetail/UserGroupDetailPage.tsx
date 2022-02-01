import React, {
  FC, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

import UserGroupForm from '../UserGroup/UserGroupForm';
import UserGroupUserTable from './UserGroupUserTable';
import UserGroupUserModal from './UserGroupUserModal';
import UserGroupPageList from './UserGroupPageList';
import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import {
  apiv3Get, apiv3Put, apiv3Delete, apiv3Post,
} from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/apiNotification';
import { IPageHasId } from '~/interfaces/page';
import {
  IUserGroup, IUserGroupHasId, IUserGroupRelation,
} from '~/interfaces/user';
import { useSWRxUserGroupPages, useSWRxUserGroupRelations } from '~/stores/user-group';


const UserGroupDetailPage: FC = () => {
  const rootElem = document.getElementById('admin-user-group-detail');
  const { t } = useTranslation();

  /*
   * State (from AdminUserGroupDetailContainer)
   */
  const [userGroup, setUserGroup] = useState<IUserGroupHasId>(JSON.parse(rootElem?.getAttribute('data-user-group') || 'null'));

  // TODO 85062: /_api/v3/user-groups/children?include_grand_child=boolean
  const [childUserGroups, setChildUserGroups] = useState<IUserGroupHasId[]>([]); // TODO 85062: fetch data on init (findChildGroupsByParentIds) For child group list
  const [grandChildUserGroups, setGrandChildUserGroups] = useState<IUserGroupHasId[]>([]); // TODO 85062: fetch data on init (findChildGroupsByParentIds) For child group list

  const [childUserGroupRelations, setChildUserGroupRelations] = useState<IUserGroupRelation[]>([]); // TODO 85062: fetch data on init (findRelationsByGroupIds) For child group list
  const [relatedPages, setRelatedPages] = useState<IPageHasId[]>([]); // For page list
  const [isUserGroupUserModalOpen, setUserGroupUserModalOpen] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<string>('partial');
  const [isAlsoMailSearched, setAlsoMailSearched] = useState<boolean>(false);
  const [isAlsoNameSearched, setAlsoNameSearched] = useState<boolean>(false);

  /*
   * Fetch
   */
  const { data: userGroupPages } = useSWRxUserGroupPages(userGroup._id, 10, 0);
  const { data: userGroupRelations, mutate: mutateUserGroupRelations } = useSWRxUserGroupRelations(userGroup._id);

  /*
   * Function
   */
  // TODO 85062: old name: switchIsAlsoMailSearched
  const toggleIsAlsoMailSearched = useCallback(() => {
    setAlsoMailSearched(prev => !prev);
  }, []);

  // TODO 85062: old name: switchIsAlsoNameSearched
  const toggleAlsoNameSearched = useCallback(() => {
    setAlsoNameSearched(prev => !prev);
  }, []);

  const switchSearchType = useCallback((searchType) => {
    setSearchType(searchType);
  }, []);

  const updateUserGroup = useCallback(async(param: Partial<IUserGroup>) => {
    const res = await apiv3Put<{ userGroup: IUserGroupHasId }>(`/user-groups/${userGroup._id}`, param);
    const { userGroup: newUserGroup } = res.data;

    setUserGroup(newUserGroup);

    return newUserGroup;
  }, [userGroup]);

  const openUserGroupUserModal = useCallback(() => {
    setUserGroupUserModalOpen(true);
  }, []);

  const closeUserGroupUserModal = useCallback(() => {
    setUserGroupUserModalOpen(false);
  }, []);

  const fetchApplicableUsers = useCallback(async(searchWord) => {
    const res = await apiv3Get(`/user-groups/${userGroup._id}/unrelated-users`, {
      searchWord,
      searchType,
      isAlsoMailSearched,
      isAlsoNameSearched,
    });

    const { users } = res.data;

    return users;
  }, [searchType, isAlsoMailSearched, isAlsoNameSearched]);

  // TODO 85062: will be used in UserGroupUserFormByInput
  const addUserByUsername = useCallback(async(username: string) => {
    await apiv3Post(`/user-groups/${userGroup._id}/users/${username}`);
    mutateUserGroupRelations();
  }, [userGroup, mutateUserGroupRelations]);

  const removeUserByUsername = useCallback(async(username: string) => {
    await apiv3Delete(`/user-groups/${userGroup._id}/users/${username}`);
    mutateUserGroupRelations();
  }, [userGroup, mutateUserGroupRelations]);

  /*
   * Dependencies
   */
  if (userGroup == null) {
    return <></>;
  }

  return (
    <div>
      <a href="/admin/user-groups" className="btn btn-outline-secondary">
        <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
        {t('admin:user_group_management.back_to_list')}
      </a>
      {/* TODO 85062: Link to the ancestors group */}
      <div className="mt-4 form-box">
        <UserGroupForm
          userGroup={userGroup}
          successedMessage={t('toaster.update_successed', { target: t('UserGroup') })}
          failedMessage={t('toaster.update_failed', { target: t('UserGroup') })}
          submitButtonLabel={t('Update')}
          onSubmit={updateUserGroup}
        />
      </div>
      <h2 className="admin-setting-header mt-4">{t('admin:user_group_management.user_list')}</h2>
      <UserGroupUserTable />
      <UserGroupUserModal />

      <h2 className="admin-setting-header mt-4">{t('admin:user_group_management.child_group_list')}</h2>

      <div className="py-3">
        <button type="button" className="btn btn-outline-secondary" data-toggle="collapse" data-target="#createChildGroupForm">
          {t('admin:user_group_management.create_child_group')}
        </button>

        <div id="createChildGroupForm" className="collapse">
          <UserGroupForm
            successedMessage={t('toaster.create_succeeded', { target: t('UserGroup') })}
            failedMessage={t('toaster.create_failed', { target: t('UserGroup') })}
            submitButtonLabel={t('Create')}
          // onSubmit={addUserGroup}
          />
        </div>
      </div>

      <h2 className="admin-setting-header mt-4">{t('Page')}</h2>
      <div className="page-list">
        <UserGroupPageList />
      </div>
    </div>
  );

};


/**
 * Wrapper component for using unstated
 */
const UserGroupDetailPageWrapper = withUnstatedContainers(UserGroupDetailPage, [AppContainer]);

export default UserGroupDetailPageWrapper;
