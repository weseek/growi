import React from 'react';
import md5 from 'md5';
import PropTypes from 'prop-types';

const DEFAULT_IMAGE = '/images/icons/user.svg';

// TODO UserComponent?
export default class UserPicture extends React.Component {

  getUserPicture(user) {
    let pictPath;

    // gravatar
    if (user.isGravatarEnabled === true) {
      pictPath = this.generateGravatarSrc(user);
    }
    // uploaded image
    if (user.image != null) {
      pictPath = user.image;
    }
    if (user.imageAttachment != null) {
      return user.imageAttachment.filePathProxied;
    }

    return pictPath || DEFAULT_IMAGE;
  }

  generateGravatarSrc(user) {
    const email = user.email || '';
    const hash = md5(email.trim().toLowerCase());
    return `https://gravatar.com/avatar/${hash}`;
  }

  getClassName() {
    const className = ['img-circle', 'picture'];
    // size
    if (this.props.size) {
      className.push(`picture-${this.props.size}`);
    }

    return className.join(' ');
  }

  renderForNull() {
    return (
      <img
        src={DEFAULT_IMAGE}
        alt="someone"
        className={this.getClassName()}
      />
    );
  }

  render() {
    const user = this.props.user;

    if (user == null) {
      return this.renderForNull();
    }

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
        : <a href={`/user/${user.username}`}>{imgElem}</a>
    );
  }

}

UserPicture.propTypes = {
  user: PropTypes.object,
  size: PropTypes.string,
  withoutLink: PropTypes.bool,
};

UserPicture.defaultProps = {
  size: null,
};
