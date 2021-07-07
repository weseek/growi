import React, { useState, useEffect } from 'react'
import UserGroupTable from './UserGroupTable';
import UserGroupCreateForm from '../../../client/js/components/Admin/UserGroup/UserGroupCreateForm';
import UserGroupDeleteModal from '../../../client/js/components/Admin/UserGroup/UserGroupDeleteModal';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { apiv3Get, apiv3Delete } from '~/utils/apiv3-client';

export default function UserGroupPage() {

  const [userGroups, setUserGroups] = useState([]);
  const [userGroupRelations, setUserGroupRelations] = useState([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isDeleteModalShow, setIsDeleteModalShow] = useState(false);

  useEffect(() => {
    await syncUserGroupAndRelations();
  }, []);

  async function showDeleteModal(group) {
    try {
      await this.syncUserGroupAndRelations();
      setSelectedUserGroup(group);
      setIsDeleteModalShow(true)
    }
    catch (err) {
      toastError(err);
    }
  }

  hideDeleteModal() {
    setSelectedUserGroup(undefined);
    setIsDeleteModalShow(false);
  }

  addUserGroup(userGroup, users) {
    this.setState((prevState) => {
      const userGroupRelations = Object.assign(prevState.userGroupRelations, {
        [userGroup._id]: users,
      });

      return {
        userGroups: [...prevState.userGroups, userGroup],
        userGroupRelations,
      };
    });
  }

  async function deleteUserGroupById({ deleteGroupId, actionName, transferToUserGroupId }) {
    try {
      const res = await apiv3Delete(`/user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });

      this.setState((prevState) => {
        const userGroups = prevState.userGroups.filter((userGroup) => {
          return userGroup._id !== deleteGroupId;
        });

        delete prevState.userGroupRelations[deleteGroupId];

        return {
          userGroups,
          userGroupRelations: prevState.userGroupRelations,
          selectedUserGroup: undefined,
          isDeleteModalShow: false,
        };
      });

      toastSuccess(`Deleted a group "${window.xss.process(res.data.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the group'));
    }
  }

  async function syncUserGroupAndRelations() {
    try {
      const userGroupsRes = await apiv3Get('/user-groups', { pagination: false });
      const userGroupRelationsRes = await apiv3Get('/user-group-relations');
      setUserGroups(userGroupsRes.data.userGroups);
      setUserGroupRelations(userGroupRelationsRes.data.userGroupRelations);
    }
    catch (err) {
      toastError(err);
    }
  }

  return (
    <>
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
        userGroups={userGroups}
        deleteUserGroup={selectedUserGroup}
        onDelete={deleteUserGroupById}
        isShow={isDeleteModalShow}
        onShow={showDeleteModal}
        onHide={hideDeleteModal}
      />
    </>
  )
}
