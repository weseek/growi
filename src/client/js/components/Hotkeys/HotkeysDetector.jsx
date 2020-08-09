import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { GlobalHotKeys } from 'react-hotkeys';

import HotkeyStroke from '../../models/HotkeyStroke';

const HotkeysDetector = (props) => {

  const { keySet, strokeSet, onDetected } = props;

  // memorize HotkeyStroke instances
  const hotkeyStrokes = useMemo(
    () => {
      const strokes = Array.from(strokeSet);
      return strokes.map(stroke => new HotkeyStroke(stroke));
    },
    [strokeSet],
  );

  /**
   * return key expression string includes modifier
   */
  const getKeyExpression = useCallback((event) => {
    let eventKey = event.key;

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

    return eventKey;
  }, []);

  const isNeedWorkaroundForMac = (eventKey) => {
    const platform = navigator.platform.toLowerCase();
    const isMac = (platform.indexOf('mac') > -1);
    const throughCommands = ['a', 'z', 'x', 'c', 'v'].map(char => `${char}+meta`);

    return isMac && throughCommands.includes(eventKey);
  };

  /**
   * evaluate the key user pressed and trigger onDetected
   */
  const checkHandler = useCallback((event) => {
    const eventKey = getKeyExpression(event);

    if (!isNeedWorkaroundForMac(eventKey)) {
      event.preventDefault();
    }

    hotkeyStrokes.forEach((hotkeyStroke) => {
      if (hotkeyStroke.evaluate(eventKey)) {
        onDetected(hotkeyStroke.stroke);
      }
    });
  }, [hotkeyStrokes, getKeyExpression, onDetected]);

  // memorize keyMap for GlobalHotKeys
  const keyMap = useMemo(() => {
    return { check: Array.from(keySet) };
  }, [keySet]);

  // memorize handlers for GlobalHotKeys
  const handlers = useMemo(() => {
    return { check: checkHandler };
  }, [checkHandler]);

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
  );

};

HotkeysDetector.propTypes = {
  onDetected: PropTypes.func.isRequired,
  keySet: PropTypes.instanceOf(Set).isRequired,
  strokeSet: PropTypes.instanceOf(Set).isRequired,
};

export default HotkeysDetector;
