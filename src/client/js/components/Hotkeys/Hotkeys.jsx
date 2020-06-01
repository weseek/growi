import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
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
    let view = null;
    if (this.state.sampleCommand) {
      view = <div>box</div>
    }
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={() => this.onDetected()} />
        {view}
      </React.Fragment>
    );
  }

}
