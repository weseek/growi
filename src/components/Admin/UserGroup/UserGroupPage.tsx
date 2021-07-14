import React, { useState, useEffect } from 'react'
import { useUserGroupSWR, useUserGroupRelationsSWR } from '~/stores/admin';
import { useAclEnabled } from '~/stores/context';

import UserGroupTable from '~/client/js/components/Admin/UserGroup/UserGroupTable';
import UserGroupCreateForm from '~/client/js/components/Admin/UserGroup/UserGroupCreateForm';
import UserGroupDeleteModal from '~/client/js/components/Admin/UserGroup/UserGroupDeleteModal';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { apiv3Get, apiv3Delete } from '~/utils/apiv3-client';
import { UserGroup, UserGroupRelation } from '~/interfaces/user';

const UserGroupPage = (): JSX.Element => {
  const isAclEnabled = useAclEnabled();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [userGroupRelations, setUserGroupRelations] = useState<UserGroupRelation[]>([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isDeleteModalShow, setIsDeleteModalShow] = useState(false);
  // TODO: Fix pagination src/server/models/user-group.ts
  // const { data: userGroupParams } = useUserGroupSWR({ pagination: false });
  const { data: userGroupRelationsParams } = useUserGroupRelationsSWR();

  useEffect(() => {
    syncUserGroupAndRelations();
  }, []);

  const showDeleteModal = async (group) => {
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

  const addUserGroup = (userGroup: UserGroup, users) => {
    setUserGroups((prevState: UserGroup[]): UserGroup[] => ([...prevState, userGroup]));
    setUserGroupRelations((prevState) => (
      Object.assign(prevState, {
        [userGroup._id]: users,
      })
    ));
  }

  const deleteUserGroupById = async ({ deleteGroupId, actionName, transferToUserGroupId }) => {
    try {
      const res = await apiv3Delete(`/user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });

      setUserGroups(prevState => {
        return prevState?.filter((userGroup) => {
          return userGroup._id !== deleteGroupId;
        })
      })

      setUserGroupRelations(prevState => {
        return prevState?.filter((userGroupRelation) => {
          return userGroupRelation._id != deleteGroupId
        });
      })

      setSelectedUserGroup(undefined);
      setIsDeleteModalShow(false);

      toastSuccess(`Deleted group "${res.data.userGroup.name}"`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the group'));
    }
  }

  const syncUserGroupAndRelations = async () => {
    try {
      // TODO: Fix pagination src/server/models/user-group.ts
      // if (userGroupParams != null) {
      //   setUserGroups(userGroupParams);
      // }
      if (userGroupRelationsParams != null) {
        setUserGroupRelations(userGroupRelationsParams);
      }
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
