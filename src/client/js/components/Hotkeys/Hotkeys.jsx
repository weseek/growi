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
      StaffCredit,
    ];
    this.keymap = this.keymapSet();
    this.hotkeyList = this.hotkeyList();
    this.onDetected = this.onDetected.bind(this);
    this.keymapSet = this.keymapSet.bind(this);
  }

  // this function generates keymap depending on what keys were selected in this.hotkeyCommand
  keymapSet() {
    let keymap = this.hotkeyList();
    keymap = keymap.flat();
    keymap = new Set(keymap);
    return Array.from(keymap);
  }

  // this function generates list of all the hotkeys commands
  hotkeyList() {
    const hotkeyList = this.supportClasses.map((value) => {
      return value.getHotkeyStroke();
    });
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
    const view = this.supportClasses.filter((value) => {
      for (let i = 0; i < this.state.stroke.length; i++) {
        if (this.state.stroke[i].toString() === value.getHotkeyStroke().toString()) {
          return value;
        }
      }
      return null;
    });
    console.log(view);
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={stroke => this.onDetected(stroke)} keymap={this.keymap} hotkeyList={this.hotkeyList} />
        {view}
      </React.Fragment>
    );
  }

}
