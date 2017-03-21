import React from 'react';
import UserList from './SeenUserList/UserList';

export default class SeenUserList extends React.Component {

  constructor(props) {
    super(props);

    this.crowi = window.crowi; // FIXME

    this.state = {
      seenUsers: [],
    };
  }

  componentDidMount() {
    const seenUserIds = this.getSeenUserIds();

    if (seenUserIds.length > 0) {
      // FIXME: user data cache
      this.crowi.apiGet('/users.list', {user_ids: seenUserIds.join(',')})
      .then(res => {
        this.setState({seenUsers: res.users});
      }).catch(err => {
        // do nothing
      });
    }
  }

  getSeenUserIds() {
    // FIXME: Consider another way to bind values.
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
      <div className="seen-user-list">
        <p className="seen-user-count">
          {this.state.seenUsers.length}
        </p>
        <UserList users={this.state.seenUsers} />
      </div>
    );
  }
}
