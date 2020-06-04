import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';
import StaffCredit from '../StaffCredit/StaffCredit';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      stroke: '',
    };
    this.onDetected = this.onDetected.bind(this);
    this.toDelete = this.toDelete.bind(this);
    this.instances = [
      <StaffCredit toDelete={this.toDelete} />,
    ];
  }

  toDelete() {
    this.setState({
      stroke: '',
    });
  }

  // activates when one of the hotkey strokes gets determined from HotkeysDetector
  onDetected(strokeDetermined) {
    this.setState({
      stroke: strokeDetermined,
    });
  }

  render() {
    console.log(this.state.stroke);
    const view = this.instances.filter((value) => {
      if (value.type.prototype.getHotkeyStroke().toString() === this.state.stroke.toString()) {
        return value;
      }
      return null;
    });
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={stroke => this.onDetected(stroke)} />
        {view}
      </React.Fragment>
    );
  }

}
