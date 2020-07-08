import React from 'react';


/**
 * Page staff credit component
 *
 * @export
 * @class StaffCredit
 * @extends {React.Component}
 */

export default class MirrorMode extends React.Component {

  // when this is called it returns the hotkey stroke
  static getHotkeyStroke() {
    return {
      stroke: ['x', 'x', 'b', 'b', 'a', 'y', 'a', 'y', 'ArrowDown', 'ArrowLeft'],
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
    };
  }

  static getComponent() {
    return <MirrorMode />;
  }

  componentDidMount() {
    const changeBody = document.body;
    changeBody.classList.add('mirror');
    return null;
  }

  render() {
    return (
      <React.Fragment>
      </React.Fragment>
    );
  }

}

MirrorMode.propTypes = {
};
