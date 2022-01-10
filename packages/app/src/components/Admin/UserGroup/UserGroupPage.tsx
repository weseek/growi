import React, {
  FC, Fragment, useState, useCallback, useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';

import UserGroupTable from './UserGroupTable';
import UserGroupForm from './UserGroupForm';
import UserGroupDeleteModal from './UserGroupDeleteModal';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IUserGroup, IUserGroupHasId, IUserGroupRelation } from '~/interfaces/user';
import Xss from '~/services/xss';
import { CustomWindow } from '~/interfaces/global';
import { apiv3Get, apiv3Delete, apiv3Post } from '~/client/util/apiv3-client';

type Props = {
  appContainer: AppContainer,
};

const UserGroupPage: FC<Props> = (props: Props) => {
  const xss: Xss = (window as CustomWindow).xss;
  const { t } = useTranslation();
  const { isAclEnabled } = props.appContainer.config;

  /*
   * State
   */
  const [userGroups, setUserGroups] = useState<IUserGroupHasId[]>([]);
  const [userGroupRelations, setUserGroupRelations] = useState<IUserGroupRelation[]>([]);
  const [childUserGroups, setChildUserGroups] = useState<IUserGroupHasId[]>([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState<IUserGroupHasId | undefined>(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isDeleteModalShown, setDeleteModalShown] = useState<boolean>(false);

  /*
   * Functions
   */
  const syncUserGroupAndRelations = useCallback(async() => {
    // TODO 85062: SWRize
    try {
      const userGroupsRes = await apiv3Get('/user-groups', { pagination: false });
      const userGroupRelationsRes = await apiv3Get('/user-group-relations');
      const childUserGroupsRes = await apiv3Get('/user-group-relations/children', { parentIds: userGroupsRes.data.userGroups.map(group => group._id) });

      setUserGroups(userGroupsRes.data.userGroups);
      setChildUserGroups(childUserGroupsRes.data.childUserGroups);
      setUserGroupRelations(userGroupRelationsRes.data.userGroupRelations);
    }
    catch (err) {
      toastError(err);
    }
  }, []);

  const showDeleteModal = useCallback(async(group: IUserGroupHasId) => {
    try {
      await syncUserGroupAndRelations();

      setSelectedUserGroup(group);
      setDeleteModalShown(true);
    }
    catch (err) {
      toastError(err);
    }
  }, []);

  const hideDeleteModal = useCallback(() => {
    setSelectedUserGroup(undefined);
    setDeleteModalShown(false);
  }, []);

  const addUserGroup = useCallback(async(userGroupData: IUserGroup) => {
    try {
      const res = await apiv3Post('/user-groups', {
        name: userGroupData.name,
        description: userGroupData.description,
        parent: userGroupData.parent,
      });

      const newUserGroup = res.data.userGroup;
      setUserGroups(prev => [...prev, newUserGroup]);
    }
    catch (err) {
      toastError(err);
    }
  }, []);

  const deleteUserGroupById = useCallback(async(deleteGroupId: string, actionName: string, transferToUserGroupId: string) => {
    try {
      const res = await apiv3Delete(`/user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });

      setUserGroups(prev => prev.filter(userGroup => userGroup._id !== deleteGroupId));
      setUserGroupRelations(prev => prev.filter(relation => relation.relatedGroup !== deleteGroupId));
      setSelectedUserGroup(undefined);
      setDeleteModalShown(false);

      toastSuccess(`Deleted a group "${xss.process(res.data.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the group'));
    }
  }, []);

  /*
   * componentDidMount
   */
  useEffect(() => {
    syncUserGroupAndRelations();
  }, []);

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
        userGroups={userGroups}
        childUserGroups={childUserGroups}
        isAclEnabled={isAclEnabled}
        onDelete={showDeleteModal}
        userGroupRelations={userGroupRelations}
      />
      <UserGroupDeleteModal
        appContainer={props.appContainer}
        userGroups={userGroups}
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
