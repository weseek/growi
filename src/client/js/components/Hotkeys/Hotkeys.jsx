import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.onDetected = this.onDetected.bind(this);
    this.state = {
      sampleCommand: true,
    };
    this.onDetected = this.onDetected.bind(this);
  }

  onDetected() {
    this.setState({
      sampleCommand: !this.state.sampleCommand,
    });
  }

  render() {
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={this.onDetected} />
      </React.Fragment>
    );
  }

}
