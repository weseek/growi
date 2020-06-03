import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sampleCommand: '',
    };
    this.onDetected = this.onDetected.bind(this);
  }

  onDetected(commandDetermined) {
    this.setState({
      sampleCommand: commandDetermined,
    });
  }

  render() {
    const view = [];
    if (this.state.sampleCommand === 'testCommand') {
      view.push(<div>box</div>);
    }
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={button => this.onDetected(button)} />
        {view}
      </React.Fragment>
    );
  }

}
