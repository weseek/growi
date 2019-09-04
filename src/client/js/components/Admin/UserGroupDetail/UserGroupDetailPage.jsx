import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import UserGroupEditForm from './UserGroupEditForm';
import UserGroupUserTable from './UserGroupUserTable';
import UserGroupUserModal from './UserGroupUserModal';
import UserGroupPageList from './UserGroupPageList';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupDetailPage extends React.Component {

  constructor(props) {
    super(props);

    const elem = document.getElementById('admin-user-group-detail');
    const userGroup = JSON.parse(elem.getAttribute('data-user-group'));
    const userGroupRelations = JSON.parse(elem.getAttribute('data-user-group-relations'));
    const notRelatedUsers = JSON.parse(elem.getAttribute('data-not-related-users'));
    const relatedPages = JSON.parse(elem.getAttribute('data-related-pages'));

    this.state = {
      userGroup,
      userGroupRelations,
      notRelatedUsers,
      relatedPages,

      isUserGroupUserModalOpen: false,
    };

    this.xss = window.xss;

    this.openUserGroupUserModal = this.openUserGroupUserModal.bind(this);
    this.closeUserGroupUserModal = this.closeUserGroupUserModal.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.addUser = this.addUser.bind(this);
  }

  openUserGroupUserModal() {
    this.setState({ isUserGroupUserModalOpen: true });
  }

  closeUserGroupUserModal() {
    this.setState({ isUserGroupUserModalOpen: false });
  }

  async removeUser(username) {
    try {
      const res = await this.props.appContainer.apiv3.delete(`/user-groups/${this.state.userGroup._id}/users/${username}`);

      this.setState((prevState) => {
        return {
          userGroupRelations: prevState.userGroupRelations.filter((u) => { return u._id !== res.data.userGroupRelation._id }),
          notRelatedUsers: [...prevState.notRelatedUsers, res.data.user],
        };
      });

      toastSuccess(`Removed "${username}" from "${this.xss.process(this.state.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error(`Unable to remove "${this.xss.process(username)}" from "${this.xss.process(this.state.userGroup.name)}"`));
    }
  }

  addUser(user, userGroup, userGroupRelation) {
    this.setState((prevState) => {
      return {
        userGroupRelations: [...prevState.userGroupRelations, userGroupRelation],
        notRelatedUsers: prevState.notRelatedUsers.filter((u) => { return u._id !== user._id }),
      };
    });
  }

  render() {
    const { t } = this.props;

    return (
      <div>
        <a href="/admin/user-groups" className="btn btn-default">
          <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
        グループ一覧に戻る
        </a>
        <UserGroupEditForm
          userGroup={this.state.userGroup}
        />
        <legend className="m-t-20">{ t('User List') }</legend>
        <UserGroupUserTable
          userGroupRelations={this.state.userGroupRelations}
          openUserGroupUserModal={this.openUserGroupUserModal}
          removeUser={this.removeUser}
        />
        <UserGroupUserModal
          show={this.state.isUserGroupUserModalOpen}
          onClose={this.closeUserGroupUserModal}
          onAdd={this.addUser}
          notRelatedUsers={this.state.notRelatedUsers}
          userGroup={this.state.userGroup}
        />
        <UserGroupPageList
          relatedPages={this.state.relatedPages}
        />
      </div>
    );
  }

}

UserGroupDetailPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupDetailPageWrapper = (props) => {
  return createSubscribedElement(UserGroupDetailPage, props, [AppContainer]);
};

export default withTranslation()(UserGroupDetailPageWrapper);
