import React from 'react';

import UserGroupEditForm from './UserGroupEditForm';
import UserGroupUserTable from './UserGroupUserTable';
import UserGroupUserModal from './UserGroupUserModal';
import UserGroupPageList from './UserGroupPageList';

class UserGroupDetailPage extends React.Component {

  constructor(props) {
    super(props);

    const elem = document.getElementById('admin-user-group-detail');
    const userGroup = JSON.parse(elem.getAttribute('data-user-group'));

    this.state = {
      userGroup,
    };
  }

  render() {

    return (
      <div>
        <a href="/admin/user-groups" className="btn btn-default">
          <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
        グループ一覧に戻る
        </a>
        <UserGroupEditForm
          userGroup={this.state.userGroup}
        />
        <UserGroupUserTable />
        <UserGroupUserModal />
        <UserGroupPageList />
      </div>
    );
  }

}

export default UserGroupDetailPage;
