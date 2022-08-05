import React, {
  FC, useState, useCallback, useEffect,
} from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import {
  apiv3Get, apiv3Put, apiv3Delete, apiv3Post,
} from '~/client/util/apiv3-client';
import { IPageHasId } from '~/interfaces/page';
import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';
import { useIsAclEnabled } from '~/stores/context';
import { useUpdateUserGroupConfirmModal } from '~/stores/modal';
import {
  useSWRxUserGroupPages, useSWRxUserGroupRelationList, useSWRxChildUserGroupList, useSWRxUserGroup,
  useSWRxSelectableParentUserGroups, useSWRxSelectableChildUserGroups, useSWRxAncestorUserGroups,
} from '~/stores/user-group';

import UserGroupDeleteModal from '../UserGroup/UserGroupDeleteModal';
import UserGroupDropdown from '../UserGroup/UserGroupDropdown';
import UserGroupForm from '../UserGroup/UserGroupForm';
import UserGroupModal from '../UserGroup/UserGroupModal';
import UserGroupTable from '../UserGroup/UserGroupTable';

import UpdateParentConfirmModal from './UpdateParentConfirmModal';
// import UserGroupPageList from './UserGroupPageList';
// import UserGroupUserModal from './UserGroupUserModal';
import UserGroupUserTable from './UserGroupUserTable';


type Props = {
  userGroupId: string,
}

const UserGroupDetailPage = (props: Props) => {
  const { t } = useTranslation();
  const { userGroupId: currentUserGroupId } = props;
  const adminUserGroupDetailElem = document.getElementById('admin-user-group-detail');

  /*
   * State (from AdminUserGroupDetailContainer)
   */
  // const [currentUserGroup, setUserGroup] = useState<IUserGroupHasId>(JSON.parse(adminUserGroupDetailElem?.getAttribute('data-user-group') || 'null'));
  const { data: userGroup } = useSWRxUserGroup(currentUserGroupId);
  const [currentUserGroup, setUserGroup] = useState<IUserGroupHasId>();
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
  const { data: userGroupPages } = useSWRxUserGroupPages(currentUserGroupId, 10, 0);


  const { data: childUserGroupsList, mutate: mutateChildUserGroups } = useSWRxChildUserGroupList([currentUserGroupId], true);
  const childUserGroups = childUserGroupsList != null ? childUserGroupsList.childUserGroups : [];
  const grandChildUserGroups = childUserGroupsList != null ? childUserGroupsList.grandChildUserGroups : [];
  const childUserGroupIds = childUserGroups.map(group => group._id);

  const { data: userGroupRelationList, mutate: mutateUserGroupRelations } = useSWRxUserGroupRelationList(childUserGroupIds);
  const childUserGroupRelations = userGroupRelationList != null ? userGroupRelationList : [];

  const { data: selectableParentUserGroups, mutate: mutateSelectableParentUserGroups } = useSWRxSelectableParentUserGroups(currentUserGroupId);
  const { data: selectableChildUserGroups, mutate: mutateSelectableChildUserGroups } = useSWRxSelectableChildUserGroups(currentUserGroupId);

  const { data: ancestorUserGroups, mutate: mutateAncestorUserGroups } = useSWRxAncestorUserGroups(currentUserGroupId);

  const { data: isAclEnabled } = useIsAclEnabled();

  const { open: openUpdateParentConfirmModal } = useUpdateUserGroupConfirmModal();


  useEffect(() => {
    setUserGroup(userGroup);
  }, [userGroup]);

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

  const updateUserGroup = useCallback(async(userGroup: IUserGroupHasId, update: Partial<IUserGroupHasId>, forceUpdateParents: boolean) => {
    if (update.parent == null) {
      throw Error('"parent" attr must not be null');
    }

    const parentId = typeof update.parent === 'string' ? update.parent : update.parent?._id;
    const res = await apiv3Put<{ userGroup: IUserGroupHasId }>(`/user-groups/${userGroup._id}`, {
      name: update.name,
      description: update.description,
      parentId,
      forceUpdateParents,
    });
    const { userGroup: updatedUserGroup } = res.data;

    setUserGroup(updatedUserGroup);

    // mutate
    mutateAncestorUserGroups();
    mutateSelectableChildUserGroups();
    mutateSelectableParentUserGroups();
  }, [setUserGroup, mutateAncestorUserGroups, mutateSelectableChildUserGroups, mutateSelectableParentUserGroups]);

  const onSubmitUpdateGroup = useCallback(
    async(targetGroup: IUserGroupHasId, userGroupData: Partial<IUserGroupHasId>, forceUpdateParents: boolean): Promise<void> => {
      try {
        await updateUserGroup(targetGroup, userGroupData, forceUpdateParents);
        toastSuccess(t('toaster.update_successed', { target: t('UserGroup') }));
      }
      catch {
        toastError(t('toaster.update_failed', { target: t('UserGroup') }));
      }
    },
    [t, updateUserGroup],
  );

  const onClickSubmitForm = useCallback(async(targetGroup: IUserGroupHasId, userGroupData: Partial<IUserGroupHasId>): Promise<void> => {
    if (userGroupData?.parent === undefined || typeof userGroupData?.parent === 'string') {
      toastError(t('Something went wrong. Please try again.'));
      return;
    }

    const prevParentId = typeof targetGroup.parent === 'string' ? targetGroup.parent : (targetGroup.parent?._id || null);
    const newParentId = typeof userGroupData.parent?._id === 'string' ? userGroupData.parent?._id : null;

    const shouldShowConfirmModal = prevParentId !== newParentId;

    if (shouldShowConfirmModal) { // show confirm modal before submiting
      await openUpdateParentConfirmModal(
        targetGroup,
        userGroupData,
        onSubmitUpdateGroup,
      );
    }
    else { // directly submit
      await onSubmitUpdateGroup(targetGroup, userGroupData, false);
    }
  }, [t, openUpdateParentConfirmModal, onSubmitUpdateGroup]);

  const fetchApplicableUsers = useCallback(async(searchWord) => {
    const res = await apiv3Get(`/user-groups/${currentUserGroupId}/unrelated-users`, {
      searchWord,
      searchType,
      isAlsoMailSearched,
      isAlsoNameSearched,
    });

    const { users } = res.data;

    return users;
  }, [currentUserGroupId, searchType, isAlsoMailSearched, isAlsoNameSearched]);

  // TODO 85062: will be used in UserGroupUserFormByInput
  const addUserByUsername = useCallback(async(username: string) => {
    await apiv3Post(`/user-groups/${currentUserGroupId}/users/${username}`);
    mutateUserGroupRelations();
  }, [currentUserGroupId, mutateUserGroupRelations]);

  const removeUserByUsername = useCallback(async(username: string) => {
    await apiv3Delete(`/user-groups/${currentUserGroupId}/users/${username}`);
    mutateUserGroupRelations();
  }, [currentUserGroupId, mutateUserGroupRelations]);

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

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup') }));

      // mutate
      mutateChildUserGroups();

      hideUpdateModal();
    }
    catch (err) {
      toastError(err);
    }
  }, [t, mutateChildUserGroups, hideUpdateModal]);

  const onClickAddExistingUserGroupButtonHandler = useCallback(async(selectedChild: IUserGroupHasId): Promise<void> => {
    // show confirm modal before submiting
    await openUpdateParentConfirmModal(
      selectedChild,
      {
        parent: currentUserGroupId,
      },
      onSubmitUpdateGroup,
    );
  }, [openUpdateParentConfirmModal, currentUserGroupId, onSubmitUpdateGroup]);

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
        parentId: currentUserGroupId,
      });

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup') }));

      // mutate
      mutateChildUserGroups();
      mutateSelectableChildUserGroups();
      mutateSelectableParentUserGroups();

      hideCreateModal();
    }
    catch (err) {
      toastError(err);
    }
  }, [currentUserGroupId, t, mutateChildUserGroups, mutateSelectableChildUserGroups, mutateSelectableParentUserGroups, hideCreateModal]);

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

  const removeChildUserGroup = useCallback(async(userGroupData: IUserGroupHasId) => {
    try {
      await apiv3Put(`/user-groups/${userGroupData._id}`, {
        name: userGroupData.name,
        description: userGroupData.description,
        parentId: null,
      });

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup') }));

      // mutate
      mutateChildUserGroups();
      mutateSelectableChildUserGroups();
    }
    catch (err) {
      toastError(err);
      throw err;
    }
  }, [t, mutateChildUserGroups, mutateSelectableChildUserGroups]);

  /*
   * Dependencies
   */
  if (currentUserGroup == null) {
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
                // eslint-disable-next-line max-len
                <li key={ancestorUserGroup._id} className={`breadcrumb-item ${ancestorUserGroup._id === currentUserGroup._id ? 'active' : ''}`} aria-current="page">
                  { ancestorUserGroup._id === currentUserGroup._id ? (
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
          userGroup={currentUserGroup}
          selectableParentUserGroups={selectableParentUserGroups}
          submitButtonLabel={t('Update')}
          onSubmit={onClickSubmitForm}
        />
      </div>
      <h2 className="admin-setting-header mt-4">{t('admin:user_group_management.user_list')}</h2>
      <UserGroupUserTable />
      {/* This compoent will be successfully shown in https://redmine.weseek.co.jp/issues/102159 */}
      {/* <UserGroupUserModal /> */}

      <h2 className="admin-setting-header mt-4">{t('admin:user_group_management.child_group_list')}</h2>
      <UserGroupDropdown
        selectableUserGroups={selectableChildUserGroups}
        onClickAddExistingUserGroupButton={onClickAddExistingUserGroupButtonHandler}
        onClickCreateUserGroupButton={showCreateModal}
      />

      <UserGroupModal
        userGroup={selectedUserGroup}
        buttonLabel={t('Update')}
        onClickSubmit={updateChildUserGroup}
        isShow={isUpdateModalShown}
        onHide={hideUpdateModal}
      />

      <UserGroupModal
        buttonLabel={t('Create')}
        onClickSubmit={createChildUserGroup}
        isShow={isCreateModalShown}
        onHide={hideCreateModal}
      />

      <UpdateParentConfirmModal />

      <UserGroupTable
        userGroups={childUserGroups}
        childUserGroups={grandChildUserGroups}
        isAclEnabled={isAclEnabled ?? false}
        onEdit={showUpdateModal}
        onRemove={removeChildUserGroup}
        onDelete={showDeleteModal}
        userGroupRelations={childUserGroupRelations}
      />

      <UserGroupDeleteModal
        userGroups={childUserGroups}
        deleteUserGroup={selectedUserGroup}
        onDelete={deleteChildUserGroupById}
        isShow={isDeleteModalShown}
        onHide={hideDeleteModal}
      />

      <h2 className="admin-setting-header mt-4">{t('Page')}</h2>
      <div className="page-list">
        {/* This compoent will be successfully shown in https://redmine.weseek.co.jp/issues/102159 */}
        {/* <UserGroupPageList /> */}
      </div>
    </div>
  );
};

export default UserGroupDetailPage;
