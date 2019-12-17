import React from 'react';
import PropTypes from 'prop-types';

export default class Username extends React.Component {

  renderForNull() {
    return <span>anyone</span>;
  }

  render() {
    const { user } = this.props;

    if (user == null) {
      return this.renderForNull();
    }

    const name = user.name || '(no name)';
    const username = user.username;
    const href = `/user/${user.username}`;

    return (
      <a href={href}>{name} (@{username})</a>
    );
  }

}

Username.propTypes = {
  user: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // Possibility of receiving a string of 'null'
};
