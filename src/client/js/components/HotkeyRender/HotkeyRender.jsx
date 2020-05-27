import React from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { Hotkey } from '../Hotkey/Hotkey';
import StaffCredit from '../StaffCredit/StaffCredit';
import MirrorMode from '../MirrorMode/MirrorMode';

export default class HotkeyRender extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      commandRender: [],
    };
    this.commandExecute = '';
    this.hotkeyCommand = {
      StaffCredit: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
      MirrorMode: ['x', 'x', 'b', 'b', 'a', 'y', 'a', 'y', 'ArrowDown', 'ArrowLeft'],
    };
    this.userCommand = [];
    this.executeRender = this.executeRender.bind(this);
    this.keymapSet = this.keymapSet.bind(this);
    this.check = this.check.bind(this);
  }

  // this function generates keymap depending on what keys were selected in this.hotkeyCommand
  keymapSet() {
    let keymap = [];
    const keys = Object.keys(this.hotkeyCommand);
    for (const i of keys) {
      keymap.push(this.hotkeyCommand[i]);
    }
    keymap = keymap.flat();
    keymap = keymap.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    return keymap;
  }

  // if there was a command storaged in commandExecute than that command will be rendered.
  executeRender(commandExecute) {
    if (commandExecute === 'StaffCredit') {
      this.setState({ commandRender: this.state.commandRender.concat(<StaffCredit />) });
    }
    else if (commandExecute === 'MirrorMode') {
      this.setState({ commandRender: this.state.commandRender.concat(<MirrorMode />) });
    }
    else {
      this.setState({ commandRender: [] });
    }
  }

  // executes every time one of the key is pressed
  check(event) {
    this.userCommand.push(event.key);
    [this.commandExecute, this.userCommand] = Hotkey(this.userCommand, this.hotkeyCommand);
    this.executeRender(this.commandExecute);
  }

  render() {
    // <React.Fragment>
    //   <Hotkey onPress={this.determineCommand}/>
    // </React.Fragment>

    const keyMap = { check: this.keymapSet() };
    const handlers = { check: (event) => { return this.check(event) } };
    return (
      <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
        {this.state.commandRender}
      </GlobalHotKeys>
    );
  }

}

HotkeyRender.propTypes = {
};
