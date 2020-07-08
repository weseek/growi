import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';
import StaffCredit from '../StaffCredit/StaffCredit';
import MirrorMode from '../MirrorMode/MirrorMode';
import ShowHotkeys from '../PageHotkeys/ShowHotkeys';
import PageEdit from '../PageHotkeys/PageEdit';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      view: [],
    };
    this.supportClasses = [
      StaffCredit,
      MirrorMode,
      ShowHotkeys,
      PageEdit,
    ];
    this.keymap = this.keymapSet();
    this.deleteRender = this.deleteRender.bind(this);
    this.hotkeyList = this.hotkeyList();
    this.onDetected = this.onDetected.bind(this);
    this.keymapSet = this.keymapSet.bind(this);
  }

  // delete the instance in state.view
  deleteRender(instance) {
    const viewCopy = this.state.view.slice();
    const index = viewCopy.lastIndexOf(instance);
    viewCopy.splice(index, 1);
    this.setState({
      view: viewCopy,
    });
    return null;
  }

  // this function generates keymap depending on what keys were selected in this.hotkeyCommand
  keymapSet() {
    let keymap = this.hotkeyList();
    keymap = keymap.flat();
    keymap = new Set(keymap);
    return Array.from(keymap);
  }

  // this function generates list of all the hotkeys command
  hotkeyList() {
    const hotkeyList = this.supportClasses.map((value) => {
      return value.getHotkeyStroke();
    });
    return hotkeyList;
  }

  // activates when one of the hotkey strokes gets determined from HotkeysDetector
  onDetected(strokeDetermined) {
    let viewDetermined = this.supportClasses.filter((value) => {
      return strokeDetermined.toString() === value.getHotkeyStroke().toString();
    });
    viewDetermined = viewDetermined.map((value) => {
      return value.getComponent(this.deleteRender);
    });
    this.setState({
      view: this.state.view.concat(viewDetermined).flat(),
    });
  }

  render() {
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={stroke => this.onDetected(stroke)} keymap={this.keymap} hotkeyList={this.hotkeyList} />
        {this.state.view}
      </React.Fragment>
    );
  }

}
