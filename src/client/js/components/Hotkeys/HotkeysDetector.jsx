import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { GlobalHotKeys } from 'react-hotkeys';

let userCommand = [];
let processingCommands = [];

const HotkeysDetector = (props) => {

  const checkHandler = useCallback((event) => {
    event.preventDefault();

    let eventKey = event.key;
    processingCommands = props.hotkeyList;

    if (event.ctrlKey) {
      eventKey += '+ctrl';
    }
    if (event.metaKey) {
      eventKey += '+meta';
    }
    if (event.altKey) {
      eventKey += '+alt';
    }
    if (event.shiftKey) {
      eventKey += '+shift';
    }

    userCommand = userCommand.concat(eventKey);

    // filters the corresponding hotkeys(keys) that the user has pressed so far
    processingCommands = processingCommands.filter((value) => {
      return value.slice(0, userCommand.length).toString() === userCommand.toString();
    });

    // executes if there were keymap that matches what the user pressed fully.
    if ((processingCommands.length === 1) && (props.hotkeyList.find(ary => ary.toString() === userCommand.toString()))) {
      props.onDetected(processingCommands[0]);
      userCommand = [];
    }
    else if (processingCommands.toString() === [].toString()) {
      userCommand = [];
    }
  }, [props]);

  const keyMap = { check: Array.from(new Set(props.hotkeyList)) };
  const handlers = { check: checkHandler };
  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
  );

};

HotkeysDetector.propTypes = {
  onDetected: PropTypes.func.isRequired,
  hotkeyList: PropTypes.array.isRequired,
};

export default HotkeysDetector;
