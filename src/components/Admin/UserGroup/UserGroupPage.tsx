import React, { useState, useEffect } from 'react'
import UserGroupTable from '~/client/js/components/Admin/UserGroup/UserGroupTable';
import UserGroupCreateForm from '~/client/js/components/Admin/UserGroup/UserGroupCreateForm';
import UserGroupDeleteModal from '~/client/js/components/Admin/UserGroup/UserGroupDeleteModal';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { apiv3Get, apiv3Delete } from '~/utils/apiv3-client';

const UserGroupPage = (): JSX.Element => {

  const [userGroups, setUserGroups] = useState([]);
  const [userGroupRelations, setUserGroupRelations] = useState([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isDeleteModalShow, setIsDeleteModalShow] = useState(false);

  useEffect(() => {
    syncUserGroupAndRelations();
  }, []);

  const showDeleteModal = async(group) => {
    try {
      await syncUserGroupAndRelations();
      setSelectedUserGroup(group);
      setIsDeleteModalShow(true)
    }
    catch (err) {
      toastError(err);
    }
  }

  const hideDeleteModal = () => {
    setSelectedUserGroup(undefined);
    setIsDeleteModalShow(false);
  }

  const addUserGroup = (userGroup, users) => {

    this.setState((prevState) => {
      const userGroupRelations = Object.assign(prevState.userGroupRelations, {
        [userGroup._id]: users,
      });

      return {
        userGroups: [...prevState.userGroups, userGroup],
        userGroupRelations,
      };
    });

    setUserGroups();
    setUserGroupRelations();


  }

  const deleteUserGroupById = async ({ deleteGroupId, actionName, transferToUserGroupId }) => {
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
          // selectedUserGroup: undefined,
          // isDeleteModalShow: false,
        };
      });



      setSelectedUserGroup(undefined);
      setIsDeleteModalShow(false);

      toastSuccess(`Deleted a group "${window.xss.process(res.data.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the group'));
    }
  }

  const syncUserGroupAndRelations = async () => {
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

export default UserGroupPage;
