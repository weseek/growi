import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import UserGroupTable from './UserGroupTable';
import UserGroupCreateForm from './UserGroupCreateForm';
import UserGroupDeleteModal from './UserGroupDeleteModal';

import apiErrorHandler from '../../../util/apiErrorHandler';

class UserGroupPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      userGroups: props.userGroups,
      selectedUserGroup: undefined,
      isDeleteModalShow: false,
    };

    this.showDeleteModal = this.showDeleteModal.bind(this);
    this.hideDeleteModal = this.hideDeleteModal.bind(this);
    this.addUserGroup = this.addUserGroup.bind(this);
    this.removeUserGroupAt = this.removeUserGroupAt.bind(this);
  }

  async showDeleteModal(group) {
    await this.syncUserGroupState();

    this.setState({
      selectedUserGroup: group,
      isDeleteModalShow: true,
    });
  }

  hideDeleteModal() {
    this.setState({
      selectedUserGroup: undefined,
      isDeleteModalShow: false,
    });
  }

  addUserGroup(newUserGroup) {
    this.setState((prevState) => {
      return {
        userGroups: [...prevState.userGroups, newUserGroup],
      };
    });
  }

  removeUserGroupAt(index) {
    // this.setState((prevState) => {
    //   return {
    //     userGroups: [...prevState.userGroups, newUserGroup],
    //     isDeleteModalShow: false,
    //   };
    // });
  }

  async syncUserGroupState() {
    let userGroups = [];

    try {
      const res = await this.props.crowi.apiGet('/v3/user-groups');
      if (res.ok) {
        userGroups = res.userGroups;
      }
      else {
        throw new Error('Unable to fetch groups from server');
      }
    }
    catch (err) {
      apiErrorHandler(err);
    }

    this.setState({ userGroups });
  }

  render() {
    return (
      <Fragment>
        <UserGroupCreateForm
          crowi={this.props.crowi}
          isAclEnabled={this.props.isAclEnabled}
          onCreate={this.addUserGroup}
        />
        <UserGroupTable
          crowi={this.props.crowi}
          userGroups={this.state.userGroups}
          userGroupRelations={this.props.userGroupRelations}
          isAclEnabled={this.props.isAclEnabled}
          onDelete={this.showDeleteModal}
        />
        <UserGroupDeleteModal
          crowi={this.props.crowi}
          userGroups={this.state.userGroups}
          deleteUserGroup={this.state.selectedUserGroup}
          isShow={this.state.isDeleteModalShow}
          onShow={this.showDeleteModal}
          onHide={this.hideDeleteModal}
        />
      </Fragment>
    );
  }

}

UserGroupPage.propTypes = {
  crowi: PropTypes.object.isRequired,
  userGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
  userGroupRelations: PropTypes.object.isRequired,
  isAclEnabled: PropTypes.bool,
};

export default UserGroupPage;
