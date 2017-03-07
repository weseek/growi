import React from 'react';

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
  name: React.PropTypes.string.isRequired,
};

