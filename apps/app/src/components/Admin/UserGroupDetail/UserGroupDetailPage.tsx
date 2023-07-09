import React, {
  useState, useCallback, useEffect, useMemo,
} from 'react';

import { objectIdUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  apiv3Get, apiv3Put, apiv3Delete, apiv3Post,
} from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';
import { SearchTypes, SearchType } from '~/interfaces/user-group';
import Xss from '~/services/xss';
import { useIsAclEnabled } from '~/stores/context';
import { useUpdateUserGroupConfirmModal } from '~/stores/modal';
import {
  useSWRxUserGroupPages, useSWRxUserGroupRelationList, useSWRxChildUserGroupList, useSWRxUserGroup,
  useSWRxSelectableParentUserGroups, useSWRxSelectableChildUserGroups, useSWRxAncestorUserGroups, useSWRxUserGroupRelations,
} from '~/stores/user-group';
import loggerFactory from '~/utils/logger';

import styles from './UserGroupDetailPage.module.scss';

const logger = loggerFactory('growi:services:AdminCustomizeContainer');

const UserGroupPageList = dynamic(() => import('./UserGroupPageList'), { ssr: false });
const UserGroupUserTable = dynamic(() => import('./UserGroupUserTable').then(mod => mod.UserGroupUserTable), { ssr: false });

const UserGroupUserModal = dynamic(() => import('./UserGroupUserModal'), { ssr: false });

const UserGroupDeleteModal = dynamic(() => import('../UserGroup/UserGroupDeleteModal').then(mod => mod.UserGroupDeleteModal), { ssr: false });
const UserGroupDropdown = dynamic(() => import('../UserGroup/UserGroupDropdown').then(mod => mod.UserGroupDropdown), { ssr: false });
const UserGroupForm = dynamic(() => import('../UserGroup/UserGroupForm').then(mod => mod.UserGroupForm), { ssr: false });
const UserGroupModal = dynamic(() => import('../UserGroup/UserGroupModal').then(mod => mod.UserGroupModal), { ssr: false });
const UserGroupTable = dynamic(() => import('../UserGroup/UserGroupTable').then(mod => mod.UserGroupTable), { ssr: false });
const UpdateParentConfirmModal = dynamic(() => import('./UpdateParentConfirmModal').then(mod => mod.UpdateParentConfirmModal), { ssr: false });


type Props = {
  userGroupId: string,
  isExternalGroup: boolean,
}

const UserGroupDetailPage = (props: Props): JSX.Element => {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const xss = useMemo(() => new Xss(), []);
  const { userGroupId: currentUserGroupId, isExternalGroup } = props;

  const { data: currentUserGroup } = useSWRxUserGroup(currentUserGroupId, isExternalGroup);

  const [searchType, setSearchType] = useState<SearchType>(SearchTypes.PARTIAL);
  const [isAlsoMailSearched, setAlsoMailSearched] = useState<boolean>(false);
  const [isAlsoNameSearched, setAlsoNameSearched] = useState<boolean>(false);
  const [selectedUserGroup, setSelectedUserGroup] = useState<IUserGroupHasId | undefined>(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isCreateModalShown, setCreateModalShown] = useState<boolean>(false);
  const [isUpdateModalShown, setUpdateModalShown] = useState<boolean>(false);
  const [isDeleteModalShown, setDeleteModalShown] = useState<boolean>(false);
  const [isUserGroupUserModalShown, setIsUserGroupUserModalShown] = useState<boolean>(false);

  const isLoading = currentUserGroup === undefined;
  const notExistsUerGroup = !isLoading && currentUserGroup == null;

  useEffect(() => {
    if (!objectIdUtils.isValidObjectId(currentUserGroupId) || notExistsUerGroup) {
      router.push('/admin/user-groups');
    }
  }, [currentUserGroup, currentUserGroupId, notExistsUerGroup, router]);


  /*
   * Fetch
   */
  const { data: userGroupPages } = useSWRxUserGroupPages(currentUserGroupId, 10, 0);

  const { data: userGroupRelations, mutate: mutateUserGroupRelations } = useSWRxUserGroupRelations(currentUserGroupId, isExternalGroup);

  const { data: childUserGroupsList, mutate: mutateChildUserGroups } = useSWRxChildUserGroupList(
    currentUserGroupId ? [currentUserGroupId] : [], true, isExternalGroup,
  );
  const childUserGroups = childUserGroupsList != null ? childUserGroupsList.childUserGroups : [];
  const grandChildUserGroups = childUserGroupsList != null ? childUserGroupsList.grandChildUserGroups : [];
  const childUserGroupIds = childUserGroups.map(group => group._id);

  const { data: userGroupRelationList, mutate: mutateUserGroupRelationList } = useSWRxUserGroupRelationList(
    childUserGroupIds, undefined, undefined, isExternalGroup,
  );
  const childUserGroupRelations = userGroupRelationList != null ? userGroupRelationList : [];

  const { data: selectableParentUserGroups, mutate: mutateSelectableParentUserGroups } = useSWRxSelectableParentUserGroups(currentUserGroupId);
  const { data: selectableChildUserGroups, mutate: mutateSelectableChildUserGroups } = useSWRxSelectableChildUserGroups(currentUserGroupId);

  const { data: ancestorUserGroups, mutate: mutateAncestorUserGroups } = useSWRxAncestorUserGroups(currentUserGroupId, isExternalGroup);

  const { data: isAclEnabled } = useIsAclEnabled();

  const { open: openUpdateParentConfirmModal } = useUpdateUserGroupConfirmModal();

  const parentUserGroup = (() => {
    if (isExternalGroup) {
      return ancestorUserGroups != null && ancestorUserGroups.length > 1
        ? ancestorUserGroups[ancestorUserGroups.length - 2] : undefined;
    }
    return selectableParentUserGroups?.find(selectableParentUserGroup => selectableParentUserGroup._id === currentUserGroup?.parent);
  })();
  /*
   * Function
   */
  const toggleIsAlsoMailSearched = useCallback(() => {
    setAlsoMailSearched(prev => !prev);
  }, []);

  const toggleAlsoNameSearched = useCallback(() => {
    setAlsoNameSearched(prev => !prev);
  }, []);

  const switchSearchType = useCallback((searchType: SearchType) => {
    setSearchType(searchType);
  }, []);

  const updateUserGroup = useCallback(async(userGroup: IUserGroupHasId, update: Partial<IUserGroupHasId>, forceUpdateParents: boolean) => {
    const parentId = typeof update.parent === 'string' ? update.parent : update.parent?._id;
    await apiv3Put<{ userGroup: IUserGroupHasId }>(`/user-groups/${userGroup._id}`, {
      name: update.name,
      description: update.description,
      parentId: parentId ?? null,
      forceUpdateParents,
    });

    // mutate
    mutateChildUserGroups();
    mutateAncestorUserGroups();
    mutateSelectableChildUserGroups();
    mutateSelectableParentUserGroups();
  }, [mutateAncestorUserGroups, mutateChildUserGroups, mutateSelectableChildUserGroups, mutateSelectableParentUserGroups]);

  const onSubmitUpdateGroup = useCallback(
    async(targetGroup: IUserGroupHasId, userGroupData: Partial<IUserGroupHasId>, forceUpdateParents: boolean): Promise<void> => {
      try {
        await updateUserGroup(targetGroup, userGroupData, forceUpdateParents);
        toastSuccess(t('toaster.update_successed', { target: t('UserGroup'), ns: 'commons' }));
      }
      catch {
        toastError(t('toaster.update_failed', { target: t('UserGroup'), ns: 'commons' }));
      }
    },
    [t, updateUserGroup],
  );

  const onClickSubmitForm = useCallback(async(targetGroup: IUserGroupHasId, userGroupData: IUserGroupHasId) => {
    if (typeof userGroupData.parent === 'string') {
      toastError(t('Something went wrong. Please try again.'));
      logger.error('Something went wrong.');
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

  const fetchApplicableUsers = useCallback(async(searchWord: string) => {
    const res = await apiv3Get(`/user-groups/${currentUserGroupId}/unrelated-users`, {
      searchWord,
      searchType,
      isAlsoMailSearched,
      isAlsoNameSearched,
    });

    const { users } = res.data;

    return users;
  }, [currentUserGroupId, searchType, isAlsoMailSearched, isAlsoNameSearched]);

  const addUserByUsername = useCallback(async(username: string) => {
    try {
      await apiv3Post(`/user-groups/${currentUserGroupId}/users/${username}`);
      setIsUserGroupUserModalShown(false);
      mutateUserGroupRelations();
      mutateUserGroupRelationList();
    }
    catch (err) {
      toastError(new Error(`Unable to add "${username}" from "${currentUserGroup?.name}"`));
    }
  }, [currentUserGroup?.name, currentUserGroupId, mutateUserGroupRelationList, mutateUserGroupRelations]);

  // Fix: invalid csrf token => https://redmine.weseek.co.jp/issues/102704
  const removeUserByUsername = useCallback(async(username: string) => {
    try {
      await apiv3Delete(`/user-groups/${currentUserGroupId}/users/${username}`);
      toastSuccess(`Removed "${xss.process(username)}" from "${xss.process(currentUserGroup?.name)}"`);
      mutateUserGroupRelationList();
    }
    catch (err) {
      toastError(new Error(`Unable to remove "${xss.process(username)}" from "${xss.process(currentUserGroup?.name)}"`));
    }
  }, [currentUserGroup?.name, currentUserGroupId, mutateUserGroupRelationList, xss]);

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
      if (isExternalGroup) {
        await apiv3Put(`/external-user-groups/${userGroupData._id}`, {
          description: userGroupData.description,
        });
      }
      else {
        await apiv3Put(`/user-groups/${userGroupData._id}`, {
          name: userGroupData.name,
          description: userGroupData.description,
          parentId: userGroupData.parent,
        });
      }

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup'), ns: 'commons' }));

      // mutate
      mutateChildUserGroups();

      hideUpdateModal();
    }
    catch (err) {
      toastError(err);
    }
  }, [t, mutateChildUserGroups, hideUpdateModal, isExternalGroup]);

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

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup'), ns: 'commons' }));

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
    const url = isExternalGroup ? `/external-user-groups/${deleteGroupId}` : `/user-groups/${deleteGroupId}`;
    try {
      const res = await apiv3Delete(url, {
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
  }, [mutateChildUserGroups, setSelectedUserGroup, setDeleteModalShown, isExternalGroup]);

  const removeChildUserGroup = useCallback(async(userGroupData: IUserGroupHasId) => {
    try {
      await apiv3Put(`/user-groups/${userGroupData._id}`, {
        name: userGroupData.name,
        description: userGroupData.description,
        parentId: null,
      });

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup'), ns: 'commons' }));

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
  if (currentUserGroup == null || currentUserGroupId == null) {
    return <></>;
  }

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/admin/user-groups" prefetch={false}>
              {t('user_group_management.group_list')}
            </Link>
          </li>
          {
            ancestorUserGroups != null && ancestorUserGroups.length > 0 && (ancestorUserGroups.map((ancestorUserGroup: IUserGroupHasId) => (
              <li
                key={ancestorUserGroup._id}
                className={`breadcrumb-item ${ancestorUserGroup._id === currentUserGroupId ? 'active' : ''}`}
                aria-current="page"
              >
                { ancestorUserGroup._id === currentUserGroupId ? (
                  <span>{ancestorUserGroup.name}</span>
                ) : (
                  <Link href={{
                    pathname: `/admin/user-group-detail/${ancestorUserGroup._id}`,
                    query: { isExternalGroup: 'true' },
                  }} prefetch={false}>
                    {ancestorUserGroup.name}
                  </Link>
                ) }
              </li>
            ))
            )
          }
        </ol>
      </nav>

      <div className="mt-4 form-box">
        <UserGroupForm
          userGroup={currentUserGroup}
          parentUserGroup={parentUserGroup}
          selectableParentUserGroups={selectableParentUserGroups}
          submitButtonLabel={t('Update')}
          onSubmit={onClickSubmitForm}
          isExternalGroup
        />
      </div>
      <h2 className="admin-setting-header mt-4">{t('user_group_management.user_list')}</h2>
      <UserGroupUserTable
        userGroupRelations={userGroupRelations}
        onClickPlusBtn={() => setIsUserGroupUserModalShown(true)}
        onClickRemoveUserBtn={removeUserByUsername}
        isExternalGroup
      />
      <UserGroupUserModal
        isOpen={isUserGroupUserModalShown}
        userGroup={currentUserGroup}
        searchType={searchType}
        isAlsoMailSearched={isAlsoMailSearched}
        isAlsoNameSearched={isAlsoNameSearched}
        onClickAddUserBtn={addUserByUsername}
        onSearchApplicableUsers={fetchApplicableUsers}
        onSwitchSearchType={switchSearchType}
        onClose={() => setIsUserGroupUserModalShown(false)}
        onToggleIsAlsoMailSearched={toggleIsAlsoMailSearched}
        onToggleIsAlsoNameSearched={toggleAlsoNameSearched}
      />

      <h2 className="admin-setting-header mt-4">{t('user_group_management.child_group_list')}</h2>
      {!isExternalGroup && <UserGroupDropdown
        selectableUserGroups={selectableChildUserGroups}
        onClickAddExistingUserGroupButton={onClickAddExistingUserGroupButtonHandler}
        onClickCreateUserGroupButton={showCreateModal}
      />}

      <UserGroupModal
        userGroup={selectedUserGroup}
        buttonLabel={t('Update')}
        onClickSubmit={updateChildUserGroup}
        isShow={isUpdateModalShown}
        onHide={hideUpdateModal}
        isExternalGroup
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
        isExternalGroup
      />

      <UserGroupDeleteModal
        userGroups={childUserGroups}
        deleteUserGroup={selectedUserGroup}
        onDelete={deleteChildUserGroupById}
        isShow={isDeleteModalShown}
        onHide={hideDeleteModal}
      />

      <h2 className="admin-setting-header mt-4">{t('Page')}</h2>
      <div className={`page-list ${styles['page-list']}`}>
        <UserGroupPageList userGroupId={currentUserGroupId} relatedPages={userGroupPages} />
      </div>
    </div>
  );
};

export default UserGroupDetailPage;
