import React from 'react';
import PropTypes from 'prop-types';

const DEFAULT_IMAGE = '/images/icons/user.svg';

// TODO UserComponent?
export default class UserPicture extends React.Component {

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

    let imgElem;

    if (user.imageUrlCached != null) {
      imgElem = (
        <img
          src={user.imageUrlCached}
          alt={user.username}
          className={this.getClassName()}
        />
      );
    }
    else {
      imgElem = this.renderForNull();
    }

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
