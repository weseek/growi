import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.onDetected = this.onDetected.bind(this);
  }

  onDetected() {
    console.log('this button was clicked from Hotkeys component!!');
  }

  render() {
    return (
      <React.Fragment>
        <HotkeysDetector onDetected={() => this.onDetected()} />
      </React.Fragment>
    );
  }

}
