import React from 'react';

import UserGroupEditForm from './UserGroupEditForm';
import UserGroupUserTable from './UserGroupUserTable';
import UserGroupPageList from './UserGroupPageList';

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
        <UserGroupUserTable
          userGroupRelations={this.state.userGroupRelations}
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

export default UserGroupDetailPage;
