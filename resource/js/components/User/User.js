import React from 'react';

import UserPicture from './UserPicture';

export default class User extends React.Component {

  render() {
    const user = this.props.user;
    const userLink = '/user/' + user.username;

    return (
      <span className="user-component">
        <a href={userLink}>
          <UserPicture user={user} />
        </a>
      </span>
    );
  }
}

User.propTypes = {
  user: React.PropTypes.object.isRequired,
};

User.defaultProps = {
};
