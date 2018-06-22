import React from 'react';
import PropTypes from 'prop-types';

export default class HackmdEditor extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.loadHandler = this.loadHandler.bind(this);
  }

  componentWillMount() {
  }

  loadHandler() {

  }

  render() {
    const envVars = this.props.crowi.config.env;
    const hackMdUri = envVars.HACKMD_URI;

    if (hackMdUri == null) {
      return <React.Fragment></React.Fragment>;
    }

    return (
      <iframe id='iframe-hackmd'
        ref='iframe'
        src={hackMdUri}
        onLoad={this.loadHandler}
      >
      </iframe>
    );
  }
}

HackmdEditor.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageIdOnHackMD: PropTypes.string,
};
