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

  renderMirrors() {
    const changeBody = document.body;
    changeBody.classList.add('reverse');
    return null;
  }

  render() {
    return (
      <React.Fragment>
        {this.renderMirrors()}
      </React.Fragment>
    );
  }

}

MirrorMode.propTypes = {
};
