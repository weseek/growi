import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';

export default class UserPictureList extends React.Component {

  constructor(props) {
    super(props);

    const userIds = this.props.userIds;

    const users = this.props.users.concat(
      // FIXME: user data cache
      this.props.crowi.findUserByIds(userIds)
    );

    this.state = {
      users: users,
    };

  }

  render() {
    const users = this.state.users.map(user => {
      return (
        <a key={user._id} data-user-id={user._id} href={'/user/' + user.username} title={user.name}>
          <UserPicture user={user} size="xs" />
        </a>
      );
    });

    return (
      <p>
        {users}
      </p>
    );
  }
}

UserPictureList.propTypes = {
  crowi: PropTypes.object.isRequired,
  userIds: PropTypes.arrayOf(PropTypes.string),
  users: PropTypes.arrayOf(PropTypes.object),
};

UserPictureList.defaultProps = {
  userIds: [],
  users: [],
};
