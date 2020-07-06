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
    return ['x', 'x', 'b', 'b', 'a', 'y', 'a', 'y', 'ArrowDown', 'ArrowLeft'];
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
