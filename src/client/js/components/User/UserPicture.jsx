import React from 'react';
import PropTypes from 'prop-types';

import { userPageRoot } from '@commons/util/path-utils';

const DEFAULT_IMAGE = '/images/icons/user.svg';

// TODO UserComponent?
export default class UserPicture extends React.Component {

  getClassName() {
    const className = ['rounded-circle', 'picture'];
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

  RootElmWithoutLink = (props) => {
    return <span {...props}>{props.children}</span>;
  }

  RootElmWithLink = (props) => {
    const { user } = this.props;
    const href = userPageRoot(user);

    return <a href={href} {...props}>{props.children}</a>;
  }

  withTooltip = (RootElm) => {
    const { user } = this.props;
    const title = `@${user.username}<br />${user.name}`;

    return props => (
      <RootElm data-toggle="tooltip" data-placement="bottom" data-html="true" title={title}>{props.children}</RootElm>
    );
  }

  render() {
    const user = this.props.user;

    if (user == null) {
      return this.renderForNull();
    }

    const { noLink, noTooltip } = this.props;

    // determine RootElm
    let RootElm = noLink ? this.RootElmWithoutLink : this.RootElmWithLink;
    if (!noTooltip) {
      RootElm = this.withTooltip(RootElm);
    }

    let userPictureSrc;
    if (user.imageUrlCached != null) {
      userPictureSrc = user.imageUrlCached;
    }
    else {
      userPictureSrc = DEFAULT_IMAGE;
    }

    return (
      <RootElm>
        <img
          src={userPictureSrc}
          alt={user.username}
          className={this.getClassName()}
        />
      </RootElm>
    );
  }

}

UserPicture.propTypes = {
  user: PropTypes.object,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  noLink: PropTypes.bool,
  noTooltip: PropTypes.bool,
};

UserPicture.defaultProps = {
  size: null,
  noLink: false,
  noTooltip: false,
};
