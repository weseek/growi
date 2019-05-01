import React from 'react';
import PropTypes from 'prop-types';

export default class UserPageLink extends React.Component {

  render() {
    const { user } = this.props;

    const name = user.name || '(no name)';
    const username = user.username;
    const href = `/user/${user.username}`;

    return (
      <a href={href}>{name} (@{username})</a>
    );
  }

}

UserPageLink.propTypes = {
  user: PropTypes.object.isRequired,
};
