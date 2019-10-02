import React from 'react';
import md5 from 'md5';
import PropTypes from 'prop-types';

// TODO UserComponent?
export default class UserPicture extends React.Component {

  getUserPicture(user) {
    // gravatar
    if (user.isGravatarEnabled === true) {
      return this.generateGravatarSrc(user);
    }
    // uploaded image
    if (user.image != null) {
      return user.image;
    }
    if (user.imageAttachment != null) {
      return user.imageAttachment.filePathProxied;
    }

    return '/images/icons/user.svg';

  }

  generateGravatarSrc(user) {
    const email = user.email || '';
    const hash = md5(email.trim().toLowerCase());
    return `https://gravatar.com/avatar/${hash}`;
  }

  getClassName() {
    const className = ['rounded-circle', 'picture'];
    // size
    if (this.props.size) {
      className.push(`picture-${this.props.size}`);
    }

    return className.join(' ');
  }

  render() {
    const user = this.props.user;
    const href = `/user/${user.username}`;

    const imgElem = (
      <img
        src={this.getUserPicture(user)}
        alt={user.username}
        className={this.getClassName()}
      />
    );

    return (
      (this.props.withoutLink)
        ? <span>{imgElem}</span>
        : <a href={href}>{imgElem}</a>
    );
  }

}

UserPicture.propTypes = {
  user: PropTypes.object.isRequired,
  size: PropTypes.string,
  withoutLink: PropTypes.bool,
};

UserPicture.defaultProps = {
  size: null,
};
