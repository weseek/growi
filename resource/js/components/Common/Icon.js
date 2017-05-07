import React from 'react';
import PropTypes from 'prop-types';

export default class Icon extends React.Component {

  render() {
    const name = this.props.name || null;
    const isSpin = this.props.spin ? ' fa-spinner' : '';

    if (!name) {
      return '';
    }

    return (
      <i className={`fa fa-${name} ${isSpin}`} />
    );
  }
}

// TODO: support size and so far
Icon.propTypes = {
  name: PropTypes.string.isRequired,
  spin: PropTypes.bool,
};

Icon.defaltProps = {
  spin: false,
};

