import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';

export default class UserList extends React.Component {

  isSeenUserListShown() {
    const userCount = this.props.users.length;
    if (0 < userCount && userCount <= 10) {
      return true;
    }

    return false;
  }

  render() {
    if (!this.isSeenUserListShown()) {
      return null;
    }

    const users = this.props.users.map((user) => {
      return (
        <a key={user._id} data-user-id={user._id} href={'/user/' + user.username} title={user.name}>
          <UserPicture user={user} size="xs" />
        </a>
      );
    });

    return (
      <p className="seen-user-list">
        {users}
      </p>
    );
  }
}

UserList.propTypes = {
  users: PropTypes.array,
};

UserList.defaultProps = {
  users: [],
};
