import React, { useState } from 'react';

import HotkeysDetector from './HotkeysDetector';
import StaffCredit from '../StaffCredit/StaffCredit';
import MirrorMode from '../MirrorMode/MirrorMode';
import ShowShortcutsModal from './Subscribers/ShowShortcutsModal';
import CreatePage from './Subscribers/CreatePage';
import EditPage from './Subscribers/EditPage';

// define supported components list
const SUPPORTED_COMPONENTS = [
  // StaffCredit,
  // MirrorMode,
  ShowShortcutsModal,
  CreatePage,
  EditPage,
];

const STROKE_TO_COMPONENT_MAP = {};
SUPPORTED_COMPONENTS.forEach((comp) => {
  const strokes = comp.getHotkeyStrokes();
  strokes.forEach((stroke) => {
    STROKE_TO_COMPONENT_MAP[stroke] = comp;
  });
});

const HotkeysManager = (props) => {
  const [view, setView] = useState([]);

  /**
   * delete the instance in state.view
   */
  const deleteRender = (instance) => {
    const index = view.lastIndexOf(instance);

    const newView = view.slice(); // shallow copy
    newView.splice(index, 1);
    setView(newView);
  };

  /**
   * activates when one of the hotkey strokes gets determined from HotkeysDetector
   */
  const onDetected = (strokeDetermined) => {
    const key = (Math.random() * 1000).toString();
    const Component = STROKE_TO_COMPONENT_MAP[strokeDetermined.toString()];
    const newComponent = <Component key={key} onDeleteRender={deleteRender} />;

    const newView = view.concat(newComponent).flat();
    setView(newView);
  };

  return (
    <>
      <HotkeysDetector onDetected={stroke => onDetected(stroke)} hotkeyList={Object.keys(STROKE_TO_COMPONENT_MAP)} />
      {view}
    </>
  );

};

export default HotkeysManager;
