import React from 'react';
import { GlobalHotKeys } from 'react-hotkeys';

import loggerFactory from '@alias/logger';

/**
 * Page staff credit component
 *
 * @export
 * @class StaffCredit
 * @extends {React.Component}
 */

export default class MirrorMode extends React.Component {

  constructor(props) {
    super(props);

    this.logger = loggerFactory('growi:StaffCredit');

    this.state = {
      isShown: false,
      userCommand: [],
    };
    this.konamiCommand = ['x', 'x', 'y', 'y'];
    this.deleteMirror = this.deleteMirror.bind(this);
  }

  checkMirror(event) {
    this.logger.debug(`'${event.key}' pressed`);
    console.log(`'${event.key}' pressed`);
    // compare keydown and next konamiCommand
    if (this.konamiCommand[this.state.userCommand.length] === event.key) {
      const nextValue = this.state.userCommand.concat(event.key);
      if (nextValue.length === this.konamiCommand.length) {
        this.setState({
          isShown: true,
          userCommand: [],
        });
      }
      else {
        // add UserCommand
        this.setState({ userCommand: nextValue });

        this.logger.debug('userCommand', this.state.userCommand);
      }
    }
    else {
      this.setState({ userCommand: [] });
    }
    console.log(`${this.state.isShown}`);
  }

  deleteMirror() {
    if (this.state.isShown) {
      this.setState({ isShown: false });
    }
  }


  renderMirrors() {
    const changeId = document.getElementById('growi_main-container');
    if (this.state.isShown) {
      changeId.classList.add('reverse');
      changeId.addEventListener('click', this.deleteMirror, false);
    }
    else if (changeId.classList.contains('reverse')) {
      changeId.classList.remove('reverse');
    }
    return null;
  }

  render() {
    const keyMap = { checkMirror: ['x', 'y', 'a', 'b', 'down', 'left'] };
    const handlers = { checkMirror: (event) => { return this.checkMirror(event) } };
    return (
      <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
        {this.renderMirrors()}
      </GlobalHotKeys>
    );
  }

}

MirrorMode.propTypes = {
};
