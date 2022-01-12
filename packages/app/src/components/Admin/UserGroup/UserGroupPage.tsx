import React, {
  FC, Fragment, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

import UserGroupTable from './UserGroupTable';
import UserGroupForm from './UserGroupForm';
import UserGroupDeleteModal from './UserGroupDeleteModal';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';
import Xss from '~/services/xss';
import { CustomWindow } from '~/interfaces/global';
import { apiv3Delete, apiv3Post } from '~/client/util/apiv3-client';
import { useSWRxUserGroupList, useSWRxChildUserGroupList, useSWRxUserGroupRelationList } from '~/stores/user-group';

type Props = {
  appContainer: AppContainer,
};

const UserGroupPage: FC<Props> = (props: Props) => {
  const xss: Xss = (window as CustomWindow).xss;
  const { t } = useTranslation();
  const { isAclEnabled } = props.appContainer.config;

  /*
   * Fetch
   */
  const { data: userGroupsData, mutate: mutateUserGroups } = useSWRxUserGroupList();
  const userGroupIds = userGroupsData?.userGroups?.map(group => group._id);
  const { data: userGroupRelationsData, mutate: mutateUserGroupRelations } = useSWRxUserGroupRelationList(userGroupIds);
  const { data: childUserGroupsData } = useSWRxChildUserGroupList(userGroupIds);

  /*
   * State
   */
  const [selectedUserGroup, setSelectedUserGroup] = useState<IUserGroupHasId | undefined>(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isDeleteModalShown, setDeleteModalShown] = useState<boolean>(false);

  /*
   * Functions
   */
  const syncUserGroupAndRelations = useCallback(async() => {
    try {
      await mutateUserGroups(undefined, true);
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

  const addUserGroup = useCallback(async(userGroupData: IUserGroup) => {
    try {
      await apiv3Post('/user-groups', {
        name: userGroupData.name,
        description: userGroupData.description,
        parent: userGroupData.parent,
      });

      // sync
      await mutateUserGroups(undefined, true);
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateUserGroups]);

  const deleteUserGroupById = useCallback(async(deleteGroupId: string, actionName: string, transferToUserGroupId: string) => {
    try {
      const res = await apiv3Delete(`/user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });

      // sync
      await mutateUserGroups(undefined, true);

      setSelectedUserGroup(undefined);
      setDeleteModalShown(false);

      toastSuccess(`Deleted a group "${xss.process(res.data.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the group'));
    }
  }, [mutateUserGroups, mutateUserGroupRelations]);

  if (userGroupsData == null || userGroupRelationsData == null || childUserGroupsData == null) {
    return <></>;
  }

  return (
    <Fragment>
      {
        isAclEnabled ? (
          <div className="mb-2">
            <button type="button" className="btn btn-outline-secondary" data-toggle="collapse" data-target="#createGroupForm">
              {t('admin:user_group_management.create_group')}
            </button>
            <div id="createGroupForm" className="collapse">
              <UserGroupForm
                successedMessage={t('toaster.create_succeeded', { target: t('UserGroup') })}
                failedMessage={t('toaster.create_failed', { target: t('UserGroup') })}
                submitButtonLabel={t('Create')}
                onSubmit={addUserGroup}
              />
            </div>
          </div>
        ) : (
          t('admin:user_group_management.deny_create_group')
        )
      }
      <UserGroupTable
        appContainer={props.appContainer}
        userGroups={userGroupsData.userGroups}
        childUserGroups={childUserGroupsData.childUserGroups}
        isAclEnabled={isAclEnabled}
        onDelete={showDeleteModal}
        userGroupRelations={userGroupRelationsData.userGroupRelations}
      />
      <UserGroupDeleteModal
        appContainer={props.appContainer}
        userGroups={userGroupsData.userGroups}
        deleteUserGroup={selectedUserGroup}
        onDelete={deleteUserGroupById}
        isShow={isDeleteModalShown}
        onShow={showDeleteModal}
        onHide={hideDeleteModal}
      />
    </Fragment>
  );
};

/**
 * Wrapper component for using unstated
 */
const UserGroupPageWrapper = withUnstatedContainers(UserGroupPage, [AppContainer]);

export default UserGroupPageWrapper;
