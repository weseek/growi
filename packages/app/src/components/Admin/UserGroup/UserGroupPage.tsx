import React, { Fragment } from 'react';

import UserGroupTable from './UserGroupTable';
import UserGroupCreateForm from './UserGroupCreateForm';
import UserGroupDeleteModal from './UserGroupDeleteModal';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IUserGroup, IUserGroupRelation } from '~/interfaces/user';
import Xss from '~/services/xss';
import { CustomWindow } from '~/interfaces/global';

type Props = {
  appContainer: AppContainer,
};
type State = {
  userGroups: IUserGroup[],
  userGroupRelations: IUserGroupRelation[],
  selectedUserGroup: IUserGroup | undefined,
  isDeleteModalShown: boolean,
};

class UserGroupPage extends React.Component<Props, State> {

  xss: Xss;

  state: State;

  constructor(props) {
    super(props);

    this.state = {
      userGroups: [],
      userGroupRelations: [],
      selectedUserGroup: undefined, // not null but undefined (to use defaultProps in UserGroupDeleteModal)
      isDeleteModalShown: false,
    };

    this.xss = (window as CustomWindow).xss;

    this.showDeleteModal = this.showDeleteModal.bind(this);
    this.hideDeleteModal = this.hideDeleteModal.bind(this);
    this.addUserGroup = this.addUserGroup.bind(this);
    this.deleteUserGroupById = this.deleteUserGroupById.bind(this);
  }

  async componentDidMount() {
    await this.syncUserGroupAndRelations();
  }

  async showDeleteModal(group: IUserGroup) {
    try {
      await this.syncUserGroupAndRelations();

      this.setState({
        selectedUserGroup: group,
        isDeleteModalShown: true,
      });
    }
    catch (err) {
      toastError(err);
    }
  }

  hideDeleteModal() {
    this.setState({
      selectedUserGroup: undefined,
      isDeleteModalShown: false,
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

  async deleteUserGroupById(deleteGroupId: string, actionName: string, transferToUserGroupId: string) {
    try {
      const res = await this.props.appContainer.apiv3.delete(`/user-groups/${deleteGroupId}`, {
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
          isDeleteModalShown: false,
        };
      });

      toastSuccess(`Deleted a group "${this.xss.process(res.data.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the group'));
    }
  }

  async syncUserGroupAndRelations() {
    try {
      const userGroupsRes = await this.props.appContainer.apiv3.get('/user-groups', { pagination: false });
      const userGroupRelationsRes = await this.props.appContainer.apiv3.get('/user-group-relations');

      this.setState({
        userGroups: userGroupsRes.data.userGroups,
        userGroupRelations: userGroupRelationsRes.data.userGroupRelations,
      });
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { isAclEnabled } = this.props.appContainer.config;

    return (
      <Fragment>
        <UserGroupCreateForm
          isAclEnabled={isAclEnabled}
          onCreate={this.addUserGroup}
        />
        <UserGroupTable
          userGroups={this.state.userGroups}
          isAclEnabled={isAclEnabled}
          onDelete={this.showDeleteModal}
          userGroupRelations={this.state.userGroupRelations}
        />
        <UserGroupDeleteModal
          appContainer={this.props.appContainer}
          userGroups={this.state.userGroups}
          deleteUserGroup={this.state.selectedUserGroup}
          onDelete={this.deleteUserGroupById}
          isShow={this.state.isDeleteModalShown}
          onShow={this.showDeleteModal}
          onHide={this.hideDeleteModal}
        />
      </Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserGroupPageWrapper = withUnstatedContainers(UserGroupPage, [AppContainer]);

export default UserGroupPageWrapper;
