import React, { FC, useState, useCallback } from 'react';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import { apiv3Delete, apiv3Post, apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';
import { useIsAclEnabled } from '~/stores/context';
import { useSWRxUserGroupList, useSWRxChildUserGroupList, useSWRxUserGroupRelationList } from '~/stores/user-group';

import { ExternalGroupManagement } from './ExternalGroup/ExternalGroupManagement';

const UserGroupDeleteModal = dynamic(() => import('./UserGroupDeleteModal').then(mod => mod.UserGroupDeleteModal), { ssr: false });
const UserGroupModal = dynamic(() => import('./UserGroupModal').then(mod => mod.UserGroupModal), { ssr: false });
const UserGroupTable = dynamic(() => import('./UserGroupTable').then(mod => mod.UserGroupTable), { ssr: false });

export const UserGroupPage: FC = () => {
  const { t } = useTranslation();

  const { data: isAclEnabled } = useIsAclEnabled();

  /*
   * Fetch
   */
  const { data: userGroupList, mutate: mutateUserGroups } = useSWRxUserGroupList();
  const userGroups = userGroupList != null ? userGroupList : [];
  const userGroupIds = userGroups.map(group => group._id);

  const { data: userGroupRelationList } = useSWRxUserGroupRelationList(userGroupIds);
  const userGroupRelations = userGroupRelationList != null ? userGroupRelationList : [];

  const { data: childUserGroupsList } = useSWRxChildUserGroupList(userGroupIds);
  const childUserGroups = childUserGroupsList != null ? childUserGroupsList.childUserGroups : [];

  /*
   * State
   */
  const [selectedUserGroup, setSelectedUserGroup] = useState<IUserGroupHasId | undefined>(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isCreateModalShown, setCreateModalShown] = useState<boolean>(false);
  const [isUpdateModalShown, setUpdateModalShown] = useState<boolean>(false);
  const [isDeleteModalShown, setDeleteModalShown] = useState<boolean>(false);

  /*
   * Functions
   */
  const showCreateModal = useCallback(() => {
    setCreateModalShown(true);
  }, [setCreateModalShown]);

  const hideCreateModal = useCallback(() => {
    setCreateModalShown(false);
  }, [setCreateModalShown]);

  const showUpdateModal = useCallback((group: IUserGroupHasId) => {
    setUpdateModalShown(true);
    setSelectedUserGroup(group);
  }, [setUpdateModalShown]);

  const hideUpdateModal = useCallback(() => {
    setUpdateModalShown(false);
    setSelectedUserGroup(undefined);
  }, [setUpdateModalShown]);

  const syncUserGroupAndRelations = useCallback(async() => {
    try {
      await mutateUserGroups();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateUserGroups]);

  const showDeleteModal = useCallback(async(group: IUserGroupHasId) => {
    try {
      await syncUserGroupAndRelations();

      setSelectedUserGroup(group);
      setDeleteModalShown(true);
    }
    catch (err) {
      toastError(err);
    }
  }, [syncUserGroupAndRelations]);

  const hideDeleteModal = useCallback(() => {
    setSelectedUserGroup(undefined);
    setDeleteModalShown(false);
  }, []);

  const createUserGroup = useCallback(async(userGroupData: IUserGroup) => {
    try {
      await apiv3Post('/user-groups', {
        name: userGroupData.name,
        description: userGroupData.description,
      });

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup'), ns: 'commons' }));

      // mutate
      await mutateUserGroups();

      hideCreateModal();
    }
    catch (err) {
      toastError(err);
    }
  }, [t, mutateUserGroups, hideCreateModal]);

  const updateUserGroup = useCallback(async(userGroupData: IUserGroupHasId) => {
    try {
      await apiv3Put(`/user-groups/${userGroupData._id}`, {
        name: userGroupData.name,
        description: userGroupData.description,
      });

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup'), ns: 'commons' }));

      // mutate
      await mutateUserGroups();

      hideUpdateModal();
    }
    catch (err) {
      toastError(err);
    }
  }, [t, mutateUserGroups, hideUpdateModal]);

  const deleteUserGroupById = useCallback(async(deleteGroupId: string, actionName: string, transferToUserGroupId: string) => {
    try {
      await apiv3Delete(`/user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });

      // sync
      await mutateUserGroups();

      setSelectedUserGroup(undefined);
      setDeleteModalShown(false);

      toastSuccess(`Deleted ${selectedUserGroup?.name} group.`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the groups'));
    }
  }, [mutateUserGroups, selectedUserGroup]);

  return (
    <div data-testid="admin-user-groups">
      <h2 className="border-bottom">{t('admin:user_group_management.user_group_management')}</h2>
      {
        isAclEnabled ? (
          <div className="mb-3">
            <button type="button" className="btn btn-outline-secondary" onClick={showCreateModal}>
              {t('admin:user_group_management.create_group')}
            </button>
          </div>
        ) : (
          t('admin:user_group_management.deny_create_group')
        )
      }

      <UserGroupModal
        buttonLabel={t('Create')}
        onClickSubmit={createUserGroup}
        isShow={isCreateModalShown}
        onHide={hideCreateModal}
      />

      <UserGroupModal
        userGroup={selectedUserGroup}
        buttonLabel={t('Update')}
        onClickSubmit={updateUserGroup}
        isShow={isUpdateModalShown}
        onHide={hideUpdateModal}
      />

      <UserGroupTable
        headerLabel={t('admin:user_group_management.group_list')}
        userGroups={userGroups}
        childUserGroups={childUserGroups}
        isAclEnabled={isAclEnabled ?? false}
        onEdit={showUpdateModal}
        onDelete={showDeleteModal}
        userGroupRelations={userGroupRelations}
      />

      <UserGroupDeleteModal
        userGroups={userGroups}
        deleteUserGroup={selectedUserGroup}
        onDelete={deleteUserGroupById}
        isShow={isDeleteModalShown}
        onHide={hideDeleteModal}
      />
      <div className="mt-5">
        <ExternalGroupManagement />
      </div>
    </div>
  );
};
