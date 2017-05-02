import React from 'react';
import PropTypes from 'prop-types';

// TODO UserComponent?
export default class UserPicture extends React.Component {

  getUserPicture(user) {
    // from swig.setFilter('picture', function(user)

    if (user.image && user.image != '/images/userpicture.png') {
      return user.image;
    } else {
      return '/images/userpicture.png';
    }
  }

  getClassName() {
    let className = ['picture', 'picture-rounded'];
    if (this.props.size) {
      className.push('picture-' + this.props.size);
    }

    return className.join(' ');
  }

  render() {
    const user = this.props.user;

    return (
      <img
        src={this.getUserPicture(user)}
        alt={user.username}
        className={this.getClassName()}
        />
    );
  }
}

UserPicture.propTypes = {
  user: PropTypes.object.isRequired,
  size: PropTypes.string,
};

UserPicture.defaultProps = {
  user: {},
  size: null,
};
