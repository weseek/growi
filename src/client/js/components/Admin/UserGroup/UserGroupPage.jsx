import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import PaginationWrapper from '../../PaginationWrapper';
import UserGroupTable from './UserGroupTable';
import UserGroupCreateForm from './UserGroupCreateForm';
import UserGroupDeleteModal from './UserGroupDeleteModal';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      userGroups: [],
      userGroupRelations: {},
      selectedUserGroup: undefined, // not null but undefined (to use defaultProps in UserGroupDeleteModal)
      isDeleteModalShow: false,
      activePage: 1,
      totalUserGroups: 0,
      pagingLimit: Infinity,
    };

    this.xss = window.xss;

    this.handlePage = this.handlePage.bind(this);
    this.showDeleteModal = this.showDeleteModal.bind(this);
    this.hideDeleteModal = this.hideDeleteModal.bind(this);
    this.addUserGroup = this.addUserGroup.bind(this);
    this.deleteUserGroupById = this.deleteUserGroupById.bind(this);
  }

  async componentDidMount() {
    await this.syncUserGroupAndRelations();
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

  async handlePage(selectedPage) {
    await this.setState({ activePage: selectedPage });
    await this.syncUserGroupAndRelations();
  }

  async syncUserGroupAndRelations() {
    let userGroups = [];
    let userGroupRelations = {};
    let totalUserGroups = 0;
    let pagingLimit = Infinity;

    try {
      const params = { page: this.state.activePage };
      const responses = await Promise.all([
        this.props.appContainer.apiv3.get('/user-groups', params),
        this.props.appContainer.apiv3.get('/user-group-relations', params),
      ]);

      const [userGroupsRes, userGroupRelationsRes] = responses;
      userGroups = userGroupsRes.data.userGroups;
      totalUserGroups = userGroupsRes.data.totalUserGroups;
      pagingLimit = userGroupsRes.data.pagingLimit;
      userGroupRelations = userGroupRelationsRes.data.userGroupRelations;

      this.setState({
        userGroups,
        userGroupRelations,
        totalUserGroups,
        pagingLimit,
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
        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalUserGroups}
          pagingLimit={this.state.pagingLimit}
          size="sm"
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
const UserGroupPageWrapper = withUnstatedContainers(UserGroupPage, [AppContainer]);

UserGroupPage.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default UserGroupPageWrapper;
