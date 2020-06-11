import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from './UserPicture';

export default class UserPictureList extends React.Component {

  render() {
    return this.props.users.map(user => (
      <span key={user._id}>
        <UserPicture user={user} size="xs" />
      </span>
    ));
  }

}

UserPictureList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object),
};

UserPictureList.defaultProps = {
  users: [],
};
