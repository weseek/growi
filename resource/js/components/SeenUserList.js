import React from 'react';
import PropTypes from 'prop-types';

import UserList from './SeenUserList/UserList';

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
      this.setState({seenUsers: this.props.crowi.findUserByIds(seenUserIds)});
    }
  }

  getSeenUserIds() {
    // FIXME: Consider another way to bind values.
    const $seenUserList = $('#seen-user-list');
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

SeenUserList.propTypes = {
  crowi: PropTypes.object.isRequired,
};
