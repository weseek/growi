import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';
import StaffCredit from '../StaffCredit/StaffCredit';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sampleCommand: '',
    };
    this.onDetected = this.onDetected.bind(this);
    this.deleteCredit = this.deleteCredit.bind(this);
  }

  deleteCredit() {
    this.setState({
      sampleCommand: '',
    });
  }

  onDetected(commandDetermined) {
    this.setState({
      sampleCommand: commandDetermined,
    });
  }

  render() {
    const view = [];
    console.log(this.state.sampleCommand);
    if (this.state.sampleCommand === 'staffCredit') {
      view.push(<StaffCredit deleteCredit={this.deleteCredit} />);
    }
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={this.onDetected} />
        {view}
      </React.Fragment>
    );
  }

}
