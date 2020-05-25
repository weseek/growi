import React from 'react';
import { GlobalHotKeys } from 'react-hotkeys';

import StaffCredit from '../StaffCredit/StaffCredit';
import MirrorMode from '../MirrorMode/MirrorMode';

export default class Hotkey extends React.Component {

  constructor(props) {
    super(props);
    this.commandExecute = false;
    this.hotkeyCommand = {
      StaffCredit: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
      MirrorMode: ['x', 'x', 'b', 'b', 'a', 'y', 'a', 'y', 'ArrowDown', 'ArrowLeft'],
    };
    this.processingCommandIds = Object.keys(this.hotkeyCommand);
    this.state = {
      userCommand: [],
    };
    this.check = this.check.bind(this);
    this.init = this.init.bind(this);
    this.keymapSet = this.keymapSet.bind(this);
  }

  // this function generates keymap depending on what keys were selected in this.hotkeyCommand
  keymapSet() {
    let keymap = [];
    const keys = Object.keys(this.hotkeyCommand);
    for (const i of keys) {
      keymap.push(this.hotkeyCommand[i]);
    }
    keymap = keymap.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    return keymap.flat();
  }

  // function to initialize the state and attributes
  init() {
    this.setState({
      userCommand: [],
    });
    this.processingCommandIds = Object.keys(this.hotkeyCommand);
  }

  check(event) {
    // console.log(`'${event.key}' pressed`);
    // compare keydown and next hotkeyCommand
    // first concat the event.key into userCommand list
    this.setState({
      userCommand: this.state.userCommand.concat(event.key),
    });

    // filters the corresponding hotkeys that the user has pressed so far
    const tempUserCommand = this.state.userCommand;
    this.processingCommandIds = this.processingCommandIds.filter((value) => {
      return this.hotkeyCommand[value].slice(0, tempUserCommand.length).toString() === tempUserCommand.toString();
    });

    // executes if there were keymap that matches what the user pressed
    if ((this.processingCommandIds.length === 1) && (this.hotkeyCommand[this.processingCommandIds[0]].toString() === this.state.userCommand.toString())) {
      this.commandExecute = this.processingCommandIds[0];
      this.init();
    }
    return null;
  }

  renderCommand() {
    let result = null;
    if (this.commandExecute === 'StaffCredit') {
      this.commandExecute = false;
      result = (
        <StaffCredit />
      );
    }
    else if (this.commandExecute === 'MirrorMode') {
      this.commandExecute = false;
      result = (
        <MirrorMode />
      );
    }
    return result;
  }


  render() {
    const keyMap = { check: this.keymapSet() };
    const handlers = { check: (event) => { return this.check(event) } };
    return (
      <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
        {/* <HotkeyRender commandExecute = {this.commandExecute} /> */}
      </GlobalHotKeys>
    );
  }

}

Hotkey.propTypes = {
};
