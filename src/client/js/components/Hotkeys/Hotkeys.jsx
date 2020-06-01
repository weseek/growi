import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sampleCommand: "",
    };
    this.onDetected = this.onDetected.bind(this);
  }

  onDetected(commandDetermined) {
    this.setState({
      sampleCommand: commandDetermined,
    });
  }

  render() {
    let view = [];
    console.log(this.state.sampleCommand);
    if (this.state.sampleCommand === "testCommand") {
      view.push(<div>box</div>)
    }
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={this.onDetected} />
        {view}
      </React.Fragment>
    );
  }

}
