import React from 'react';
import PropTypes from 'prop-types';
import { GlobalHotKeys } from 'react-hotkeys';

export default class HotkeysDetector extends React.Component {

  constructor(props) {
    super(props);
    this.hotkeyCommand = {
      testCommand: ['x', 'x', 'y'],
    };
    this.state = {
      userCommand: [],
    }
    this.onDetected = this.props.onDetected;
    this.processingCommands = [];
    this.check = this.check.bind(this);
  }

    check(event) {
      console.log(event.key);
      this.setState({
        userCommand: this.state.userCommand.concat(event.key),
      });
    
      // filters the corresponding hotkeys(keys) that the user has pressed so far
      const tempUserCommand = this.state.userCommand;
      this.processingCommands = Object.keys(this.hotkeyCommand).filter((value) => {
        return this.hotkeyCommand[value].slice(0, tempUserCommand.length).toString() === tempUserCommand.toString();
      });

      // executes if there were keymap that matches what the user pressed fully.
      if ((this.processingCommands.length === 1) && (this.hotkeyCommand[this.processingCommands[0]].toString() === this.state.userCommand.toString())) {
        this.props.onDetected(this.processingCommands[0]);
        this.setState({
          userCommand: [],
        })
      }else if (this.processingCommands.toString() === [].toString()) {
        this.setState({
          userCommand: [],
        })
      }
      return null;

    }

  render() {
    const keyMap = { check: ['x', 'y'] };
    const handlers = { check: (event) => { return this.check(event) } };
    return (
      <GlobalHotKeys>
        <button type="button" onClick={() => { this.props.onDetected('button1') }}>
          Click!
        </button>
        <button type="button" onClick={() => { this.props.onDetected('button2') }}>
          Click!
        </button>
      </GlobalHotKeys>
    );
  }

}

HotkeysDetector.propTypes = {
  onDetected: PropTypes.func.isRequired,
};
