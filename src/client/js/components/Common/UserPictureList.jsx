import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';

export default class UserPictureList extends React.Component {

  render() {
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

UserPictureList.propTypes = {
  users: PropTypes.array,
};

UserPictureList.defaultProps = {
  users: [],
};
