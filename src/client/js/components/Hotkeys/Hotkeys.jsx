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
    this.keymapSet = this.keymapSet.bind(this);
    this.instances = [
      <StaffCredit toDelete={this.toDelete} />,
    ];
    this.keymap = this.keymapSet();
  }

  // this function generates keymap depending on what keys were selected in this.hotkeyCommand
  keymapSet() {
    let keymap = [];
    for (const instance of this.instances) {
      keymap.push(instance.type.prototype.getHotkeyStroke());
    }
    keymap = keymap.flat();
    keymap = new Set(keymap);
    return Array.from(keymap);
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
    const view = [];
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={stroke => this.onDetected(stroke)} keymap={this.keymap} />
        {view}
      </React.Fragment>
    );
  }

}
