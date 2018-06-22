import React from 'react';
import PropTypes from 'prop-types';

export default class HackmdEditor extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {

    };

  }

  componentWillMount() {
  }

  render() {
    const envVars = this.props.crowi.config.env;
    const hackMdUri = envVars.HACKMD_URI;
    if (hackMdUri == null) {
      return <React.Fragment></React.Fragment>;
    }

    return (
      <iframe src={hackMdUri}>
      </iframe>
    );
  }
}

HackmdEditor.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageIdOnHackMD: PropTypes.string,
};
