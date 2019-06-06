import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import UserGroupTable from './UserGroupTable';
import UserGroupCreateForm from './UserGroupCreateForm';
import UserGroupDeleteModal from './UserGroupDeleteModal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      userGroups: props.userGroups,
      userGroupRelations: props.userGroupRelations,
      selectedUserGroup: undefined, // not null but undefined (to use defaultProps in UserGroupDeleteModal)
      isDeleteModalShow: false,
    };

    this.xss = window.xss;

    this.showDeleteModal = this.showDeleteModal.bind(this);
    this.hideDeleteModal = this.hideDeleteModal.bind(this);
    this.addUserGroup = this.addUserGroup.bind(this);
    this.deleteUserGroupById = this.deleteUserGroupById.bind(this);
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
          isDeleteModalShow: false,
        };
      });

      toastSuccess(`Deleted a group "${this.xss.process(res.data.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the group'));
    }
  }

  async syncUserGroupAndRelations() {
    let userGroups = [];
    let userGroupRelations = {};

    try {
      const responses = await Promise.all([
        this.props.appContainer.apiv3.get('/user-groups'),
        this.props.appContainer.apiv3.get('/user-group-relations'),
      ]);

      const [userGroupsRes, userGroupRelationsRes] = responses;
      userGroups = userGroupsRes.data.userGroups;
      userGroupRelations = userGroupRelationsRes.data.userGroupRelations;

      this.setState({
        userGroups,
        userGroupRelations,
      });
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    return (
      <Fragment>
        <UserGroupCreateForm
          isAclEnabled={this.props.isAclEnabled}
          onCreate={this.addUserGroup}
        />
        <UserGroupTable
          userGroups={this.state.userGroups}
          userGroupRelations={this.state.userGroupRelations}
          isAclEnabled={this.props.isAclEnabled}
          onDelete={this.showDeleteModal}
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

/**
 * Wrapper component for using unstated
 */
const UserGroupPageWrapper = (props) => {
  return createSubscribedElement(UserGroupPage, props, [AppContainer]);
};

UserGroupPage.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  userGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
  userGroupRelations: PropTypes.object.isRequired,
  isAclEnabled: PropTypes.bool,
};

export default UserGroupPageWrapper;
