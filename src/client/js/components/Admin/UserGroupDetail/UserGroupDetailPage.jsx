import React from 'react';
import PropTypes from 'prop-types';

import UserGroupEditForm from './UserGroupEditForm';
import UserGroupUserTable from './UserGroupUserTable';
import UserGroupUserModal from './UserGroupUserModal';
import UserGroupPageList from './UserGroupPageList';

class UserGroupDetailPage extends React.Component {

  render() {

    return (
      <div>
        <a href="/admin/user-groups" className="btn btn-default">
          <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
        グループ一覧に戻る
        </a>
        <UserGroupEditForm
          userGroup={this.props.userGroup}
        />
        <UserGroupUserTable />
        <UserGroupUserModal />
        <UserGroupPageList />
      </div>
    );
  }

}

UserGroupDetailPage.propTypes = {
  userGroup: PropTypes.object.isRequired,
};

export default UserGroupDetailPage;
