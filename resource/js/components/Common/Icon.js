import React from 'react';
import PropTypes from 'prop-types';

export default class Icon extends React.Component {

  render() {
    const name = this.props.name || null;

    if (!name) {
      return '';
    }

    return (
      <i className={"fa fa-" + name} />
    );
  }
}

// TODO: support spin, size and so far
Icon.propTypes = {
  name: PropTypes.string.isRequired,
};

