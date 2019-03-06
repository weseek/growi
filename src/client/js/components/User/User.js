import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from './UserPicture';

export default class User extends React.Component {
  render() {
    const user = this.props.user;
    const userLink = `/user/${user.username}`;

    const username = this.props.username;
    const name = this.props.name;

    return (
      <span className="user-component">
        <a href={userLink}>
          <UserPicture user={user} />

          {username
              && (
              <span className="user-component-username">
@
                {user.username}
              </span>
)
          }
          {name
              && (
              <span className="user-component-name">
(
                {user.name}
)
              </span>
)
          }
        </a>
      </span>
    );
  }
}

User.propTypes = {
  user: PropTypes.object.isRequired,
  name: PropTypes.bool.isRequired,
  username: PropTypes.bool.isRequired,
};

User.defaultProps = {
  name: false,
  username: false,
};
