import React from 'react';
import UserPicture from './User/UserPicture';

export default class UserList extends React.Component {

  render() {
    const users = this.props.users.map((user) => {
      return (
        <a data-user-id={user._id} href={'/user/' + user.username} title={user.name}>
          <UserPicture user={user} />
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
  users: React.PropTypes.array,
};

UserList.defaultProps = {
  users: [],
};
