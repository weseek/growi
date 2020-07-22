import React from 'react';
import HotkeysDetector from '../HotkeysDetector/HotkeysDetector';
import StaffCredit from '../StaffCredit/StaffCredit';
import MirrorMode from '../MirrorMode/MirrorMode';
import ShowHotkeys from '../PageHotkeys/ShowHotkeys';
import PageCreate from '../PageHotkeys/PageCreate';
import PageEdit from '../PageHotkeys/PageEdit';


const SUPPORTED_COMPONENTS = [
  StaffCredit,
  MirrorMode,
  ShowHotkeys,
  PageCreate,
  PageEdit,
];

export default class Hotkeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      view: [],
    };

    this.strokeToComponentMap = {};
    SUPPORTED_COMPONENTS.forEach((comp) => {
      const strokes = comp.getHotkeyStrokes();
      strokes.forEach((stroke) => {
        this.strokeToComponentMap[stroke.toString()] = comp;
      });
    });

    // generates list of all the hotkeys command
    this.hotkeyList = Object.keys(this.strokeToComponentMap);

    // generates keymap depending on what keys were selected in this.hotkeyCommand
    this.keymap = Array.from(new Set(this.hotkeyList));

    this.deleteRender = this.deleteRender.bind(this);
    this.onDetected = this.onDetected.bind(this);
  }

  /**
   * delete the instance in state.view
   */
  deleteRender(instance) {
    const { view } = this.state;
    const index = view.lastIndexOf(instance);

    const newView = view.slice(); // shallow copy
    newView.splice(index, 1);
    this.setState({
      view: newView,
    });
  }

  /**
   * activates when one of the hotkey strokes gets determined from HotkeysDetector
   */
  onDetected(strokeDetermined) {
    const key = (Math.random() * 1000).toString();
    const Component = this.strokeToComponentMap[strokeDetermined.toString()];
    const newComponent = <Component key={key} onDeleteRender={this.deleteRender} />;

    this.setState({
      view: this.state.view.concat(newComponent).flat(),
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
