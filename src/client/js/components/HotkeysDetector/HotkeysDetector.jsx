import React from 'react';
import PropTypes from 'prop-types';
import { GlobalHotKeys } from 'react-hotkeys';

export default class HotkeysDetector extends React.Component {

  render() {
    return (
      <GlobalHotKeys>
        <button type="button" onClick={this.onDetected}>
          Click!
        </button>
        <button type="button" onClick={this.onDetected}>
          Click!
        </button>
      </GlobalHotKeys>
    );
  }

}

HotkeysDetector.propTypes = {
  onDetected: PropTypes.func.isRequired,
};
