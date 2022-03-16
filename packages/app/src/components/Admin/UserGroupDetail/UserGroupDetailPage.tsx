import React, {
  FC, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

import UserGroupForm from '../UserGroup/UserGroupForm';
import UserGroupTable from '../UserGroup/UserGroupTable';
import UserGroupModal from '../UserGroup/UserGroupModal';
import UserGroupDeleteModal from '../UserGroup/UserGroupDeleteModal';
import UserGroupDropdown from '../UserGroup/UserGroupDropdown';
import UserGroupUserTable from './UserGroupUserTable';
import UserGroupUserModal from './UserGroupUserModal';
import UserGroupPageList from './UserGroupPageList';

import {
  apiv3Get, apiv3Put, apiv3Delete, apiv3Post,
} from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IPageHasId } from '~/interfaces/page';
import {
  IUserGroup, IUserGroupHasId,
} from '~/interfaces/user';
import {
  useSWRxUserGroupPages, useSWRxUserGroupRelationList, useSWRxChildUserGroupList,
  useSWRxSelectableParentUserGroups, useSWRxSelectableChildUserGroups, useSWRxAncestorUserGroups,
} from '~/stores/user-group';
import { useIsAclEnabled } from '~/stores/context';

const UserGroupDetailPage: FC = () => {
  const { t } = useTranslation();
  const adminUserGroupDetailElem = document.getElementById('admin-user-group-detail');

  /*
   * State (from AdminUserGroupDetailContainer)
   */
  const [userGroup, setUserGroup] = useState<IUserGroupHasId>(JSON.parse(adminUserGroupDetailElem?.getAttribute('data-user-group') || 'null'));
  const [relatedPages, setRelatedPages] = useState<IPageHasId[]>([]); // For page list
  const [searchType, setSearchType] = useState<string>('partial');
  const [isAlsoMailSearched, setAlsoMailSearched] = useState<boolean>(false);
  const [isAlsoNameSearched, setAlsoNameSearched] = useState<boolean>(false);
  const [selectedUserGroup, setSelectedUserGroup] = useState<IUserGroupHasId | undefined>(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isCreateModalShown, setCreateModalShown] = useState<boolean>(false);
  const [isUpdateModalShown, setUpdateModalShown] = useState<boolean>(false);
  const [isDeleteModalShown, setDeleteModalShown] = useState<boolean>(false);

  /*
   * Fetch
   */
  const { data: userGroupPages } = useSWRxUserGroupPages(userGroup._id, 10, 0);

  const { data: childUserGroupsList, mutate: mutateChildUserGroups } = useSWRxChildUserGroupList([userGroup._id], true);
  const childUserGroups = childUserGroupsList != null ? childUserGroupsList.childUserGroups : [];
  const grandChildUserGroups = childUserGroupsList != null ? childUserGroupsList.grandChildUserGroups : [];
  const childUserGroupIds = childUserGroups.map(group => group._id);

  const { data: userGroupRelationList, mutate: mutateUserGroupRelations } = useSWRxUserGroupRelationList(childUserGroupIds);
  const childUserGroupRelations = userGroupRelationList != null ? userGroupRelationList : [];

  const { data: selectableParentUserGroups } = useSWRxSelectableParentUserGroups(userGroup._id);
  const { data: selectableChildUserGroups, mutate: mutateSelectableChildUserGroups } = useSWRxSelectableChildUserGroups(userGroup._id);

  const { data: ancestorUserGroups } = useSWRxAncestorUserGroups(userGroup._id);

  const { data: isAclEnabled } = useIsAclEnabled();

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
    try {
      const res = await apiv3Put<{ userGroup: IUserGroupHasId }>(`/user-groups/${userGroup._id}`, param);
      const { userGroup: newUserGroup } = res.data;
      setUserGroup(newUserGroup);
      toastSuccess(t('toaster.update_successed', { target: t('UserGroup') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, userGroup._id, setUserGroup]);

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

  const showUpdateModal = useCallback((group: IUserGroupHasId) => {
    setUpdateModalShown(true);
    setSelectedUserGroup(group);
  }, [setUpdateModalShown]);

  const hideUpdateModal = useCallback(() => {
    setUpdateModalShown(false);
    setSelectedUserGroup(undefined);
  }, [setUpdateModalShown]);

  const updateChildUserGroup = useCallback(async(userGroupData: IUserGroupHasId) => {
    try {
      await apiv3Put(`/user-groups/${userGroupData._id}`, {
        name: userGroupData.name,
        description: userGroupData.description,
        parentId: userGroupData.parent,
      });
      mutateChildUserGroups();
      toastSuccess(t('toaster.update_successed', { target: t('UserGroup') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, mutateChildUserGroups]);

  const onClickAddChildButtonHandler = async(selectedUserGroup: IUserGroupHasId) => {
    try {
      await apiv3Put(`/user-groups/${selectedUserGroup._id}`, {
        name: selectedUserGroup.name,
        description: selectedUserGroup.description,
        parentId: userGroup._id,
        forceUpdateParents: false,
      });
      mutateSelectableChildUserGroups();
      mutateChildUserGroups();
      toastSuccess(t('toaster.update_successed', { target: t('UserGroup') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  const showCreateModal = useCallback(() => {
    setCreateModalShown(true);
  }, [setCreateModalShown]);

  const hideCreateModal = useCallback(() => {
    setCreateModalShown(false);
  }, [setCreateModalShown]);

  const createChildUserGroup = useCallback(async(userGroupData: IUserGroup) => {
    try {
      await apiv3Post('/user-groups', {
        name: userGroupData.name,
        description: userGroupData.description,
        parentId: userGroup._id,
      });
      mutateChildUserGroups();
      toastSuccess(t('toaster.update_successed', { target: t('UserGroup') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, userGroup, mutateChildUserGroups]);

  const showDeleteModal = useCallback(async(group: IUserGroupHasId) => {
    setSelectedUserGroup(group);
    setDeleteModalShown(true);
  }, [setSelectedUserGroup, setDeleteModalShown]);

  const hideDeleteModal = useCallback(() => {
    setSelectedUserGroup(undefined);
    setDeleteModalShown(false);
  }, [setSelectedUserGroup, setDeleteModalShown]);

  const deleteChildUserGroupById = useCallback(async(deleteGroupId: string, actionName: string, transferToUserGroupId: string) => {
    try {
      const res = await apiv3Delete(`/user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });

      // sync
      await mutateChildUserGroups();

      setSelectedUserGroup(undefined);
      setDeleteModalShown(false);

      toastSuccess(`Deleted ${res.data.userGroups.length} groups.`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the groups'));
    }
  }, [mutateChildUserGroups, setSelectedUserGroup, setDeleteModalShown]);

  /*
   * Dependencies
   */
  if (userGroup == null) {
    return <></>;
  }

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/admin/user-groups">{t('admin:user_group_management.group_list')}</a></li>
          {
            ancestorUserGroups != null && ancestorUserGroups.length > 0 && (
              ancestorUserGroups.map((ancestorUserGroup: IUserGroupHasId) => (
                <li key={ancestorUserGroup._id} className={`breadcrumb-item ${ancestorUserGroup._id === userGroup._id ? 'active' : ''}`} aria-current="page">
                  { ancestorUserGroup._id === userGroup._id ? (
                    <>{ancestorUserGroup.name}</>
                  ) : (
                    <a href={`/admin/user-group-detail/${ancestorUserGroup._id}`}>{ancestorUserGroup.name}</a>
                  )}
                </li>
              ))
            )
          }
        </ol>
      </nav>

      <div className="mt-4 form-box">
        <UserGroupForm
          userGroup={userGroup}
          submitButtonLabel={t('Update')}
          onSubmit={updateUserGroup}
        />
      </div>
      <h2 className="admin-setting-header mt-4">{t('admin:user_group_management.user_list')}</h2>
      <UserGroupUserTable />
      <UserGroupUserModal />

      <h2 className="admin-setting-header mt-4">{t('admin:user_group_management.child_group_list')}</h2>
      <UserGroupDropdown
        selectableUserGroups={selectableChildUserGroups}
        onClickAddExistingUserGroupButtonHandler={onClickAddChildButtonHandler}
        onClickCreateUserGroupButtonHandler={showCreateModal}
      />

      <UserGroupModal
        userGroup={selectedUserGroup}
        buttonLabel={t('Update')}
        onClickButton={updateChildUserGroup}
        isShow={isUpdateModalShown}
        onHide={hideUpdateModal}
      />

      <UserGroupModal
        buttonLabel={t('Create')}
        onClickButton={createChildUserGroup}
        isShow={isCreateModalShown}
        onHide={hideCreateModal}
      />

      <UserGroupTable
        userGroups={childUserGroups}
        childUserGroups={grandChildUserGroups}
        isAclEnabled={isAclEnabled ?? false}
        onEdit={showUpdateModal}
        onDelete={showDeleteModal}
        userGroupRelations={childUserGroupRelations}
      />

      <UserGroupDeleteModal
        userGroups={childUserGroups}
        deleteUserGroup={selectedUserGroup}
        onDelete={deleteChildUserGroupById}
        isShow={isDeleteModalShown}
        onShow={showDeleteModal}
        onHide={hideDeleteModal}
      />

      <h2 className="admin-setting-header mt-4">{t('Page')}</h2>
      <div className="page-list">
        <UserGroupPageList />
      </div>
    </div>
  );
};

export default UserGroupDetailPage;
