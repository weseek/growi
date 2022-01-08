import React, {
  FC, Fragment, useState, useCallback, useEffect,
} from 'react';

import UserGroupTable from './UserGroupTable';
import UserGroupCreateForm from './UserGroupCreateForm';
import UserGroupDeleteModal from './UserGroupDeleteModal';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IUserGroupHasId, IUserGroupRelation } from '~/interfaces/user';
import Xss from '~/services/xss';
import { CustomWindow } from '~/interfaces/global';
import { apiv3Get, apiv3Delete } from '~/client/util/apiv3-client';

type Props = {
  appContainer: AppContainer,
};

const UserGroupPage: FC<Props> = (props: Props) => {
  const xss: Xss = (window as CustomWindow).xss;
  const { isAclEnabled } = props.appContainer.config;

  /*
   * State
   */
  const [userGroups, setUserGroups] = useState<IUserGroupHasId[]>([]);
  const [userGroupRelations, setUserGroupRelations] = useState<IUserGroupRelation[]>([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState<IUserGroupHasId | undefined>(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isDeleteModalShown, setDeleteModalShown] = useState<boolean>(false);

  /*
   * Functions
   */
  const syncUserGroupAndRelations = useCallback(async() => {
    try {
      const userGroupsRes = await apiv3Get('/user-groups', { pagination: false });
      const userGroupRelationsRes = await apiv3Get('/user-group-relations');

      setUserGroups(userGroupsRes.data.userGroups);
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

  const addUserGroup = useCallback((userGroup: IUserGroupHasId, userGroupRelations: IUserGroupRelation[]) => {
    setUserGroups(prev => [...prev, userGroup]);
    setUserGroupRelations(prev => ([...prev, ...userGroupRelations]));
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
      <UserGroupCreateForm
        isAclEnabled={isAclEnabled}
        onCreate={addUserGroup}
      />
      <UserGroupTable
        userGroups={userGroups}
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
