import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';
import StaffCredit from '../StaffCredit/StaffCredit';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      stroke: [],
    };
    this.supportClasses = [
      <StaffCredit />,
    ];
    this.onDetected = this.onDetected.bind(this);
  }

  // this function generates list of all the hotkeys commands
  hotkeyList() {
    const hotkeyList = [];
    for (const supportClass of this.supportClasses) {
      hotkeyList.push(supportClass.getHotkeyStroke());
    }
    return hotkeyList;
  }

  // activates when one of the hotkey strokes gets determined from HotkeysDetector
  onDetected(strokeDetermined) {
    this.setState({
      stroke: this.state.stroke.concat([strokeDetermined]),
    });
  }

  render() {
    console.log(this.state.stroke);
    const view = [];
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={stroke => this.onDetected(stroke)} hotkeyList={this.hotkeyList} />
        {view}
      </React.Fragment>
    );
  }

}
