import React, { Fragment } from 'react';
import { useUserGroupSWR, useUserGroupRelationsSWR } from '~/stores/admin';

import UserGroupTable from './UserGroupTable';
import UserGroupCreateForm from './UserGroupCreateForm';
import UserGroupDeleteModal from './UserGroupDeleteModal';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { apiv3Delete } from '~/utils/apiv3-client';

class UserGroupPageBody extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      userGroups: [],
      userGroupRelations: [],
      selectedUserGroup: undefined, // not null but undefined (to use defaultProps in UserGroupDeleteModal)
      isDeleteModalShow: false,
    };

    this.showDeleteModal = this.showDeleteModal.bind(this);
    this.hideDeleteModal = this.hideDeleteModal.bind(this);
    this.addUserGroup = this.addUserGroup.bind(this);
    this.deleteUserGroupById = this.deleteUserGroupById.bind(this);
  }

  syncUserGroupAndRelations() {
    // this.props.mutateGroups();
    this.props.mutateRelations();
  }

  async showDeleteModal(group) {
    try {
      await this.syncUserGroupAndRelations();

      this.setState({
        selectedUserGroup: group,
        isDeleteModalShow: true,
      });
    }
    catch (err) {
      toastError(err);
    }
  }

  hideDeleteModal() {
    this.setState({
      selectedUserGroup: undefined,
      isDeleteModalShow: false,
    });
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

  async deleteUserGroupById({ deleteGroupId, actionName, transferToUserGroupId }) {
    try {
      const res = await apiv3Delete(`/user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });
      this.syncUserGroupAndRelations();
      this.setState({
        selectedUserGroup: undefined,
        isDeleteModalShow: false,
      });

      toastSuccess(`Deleted group "${res.data.userGroup.name}"`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the group'));
    }
  }

  render() {
    // TODO GW-5305 retrieve isAclEnabled from SWR or getServerSideProps
    // const { isAclEnabled } = this.props.appContainer.config;
    const isAclEnabled = true;

    return (
      <Fragment>
        <UserGroupCreateForm
          isAclEnabled={isAclEnabled}
          onCreate={this.syncUserGroupAndRelations}
        />
        <UserGroupTable
          userGroups={this.state.userGroups}
          isAclEnabled={isAclEnabled}
          onDelete={this.showDeleteModal}
          userGroupRelations={this.state.userGroupRelations}
        />
        <UserGroupDeleteModal
          userGroups={this.state.userGroups}
          deleteUserGroup={this.state.selectedUserGroup}
          onDelete={this.deleteUserGroupById}
          isShow={this.state.isDeleteModalShow}
          onShow={this.showDeleteModal}
          onHide={this.hideDeleteModal}
        />
      </Fragment>
    );
  }

}

const UserGroupPage = () => {
  // TODO: Fix pagination src/server/models/user-group.ts
  const userGroupsData = [];
  // const { data: userGroupsData, mutate: mutateGroups } = useUserGroupSWR({ pagination: false });
  const { data: userGroupRelationsData, mutate: mutateRelations } = useUserGroupRelationsSWR();
  return (
    <>
      {userGroupRelationsData != null &&
        <UserGroupPageBody
          userGroupsData={userGroupsData}
          userGroupRelationsData={userGroupRelationsData}
          mutateRelations={mutateRelations}
        />
      }
    </>
  )
}

export default UserGroupPage;
