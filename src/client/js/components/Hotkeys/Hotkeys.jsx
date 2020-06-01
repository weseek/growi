import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';
import StaffCredit from '../StaffCredit/StaffCredit';
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
    if (this.state.sampleCommand === "staffCredit") {
      view.push(<StaffCredit />);
    }
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={this.onDetected} />
        {view}
      </React.Fragment>
    );
  }

}
