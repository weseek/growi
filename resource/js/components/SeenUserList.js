import React from 'react';
import UserList from './UserList';
import $ from 'jquery';

export default class SeenUserList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      seenUsers: [],
    };
  }

  componentDidMount() {
    const seenUserIds = this.getSeenUserIds();
    if (seenUserIds.length > 0) {
      // FIXME: user data cache
      $.get('/_api/users.list', {user_ids: seenUserIds.join(',')}, function(res) {
        // ignore unless response has error
        if (res.ok) {
          this.setState({seenUsers: res.users});
        }
      }.bind(this));
    }
  }

  getSeenUserIds() {
    const $seenUserList = $("#seen-user-list");
    if ($seenUserList.length > 0) {
      const seenUsers = $seenUserList.data('seen-users');
      if (seenUsers) {
        return seenUsers.split(',');
      }
    }

    return [];
  }

  render() {
    return (
      <p className="seen-user-list">
        <p className="seen-user-count">
          {this.state.seenUsers.length}
        </p>
        <UserList users={this.state.seenUsers} />
      </p>
    );
  }
}
