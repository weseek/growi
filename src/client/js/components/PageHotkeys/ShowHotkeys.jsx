import React from 'react';

/**
 *
 * @export
 * @extends {React.Component}
 */

export default class ShowHotkeys extends React.Component {

  // when this is called it returns the hotkey stroke
  static getHotkeyStroke() {
    return [['/+ctrl'], ['/+meta']];
  }

  static getComponent() {
    return <ShowHotkeys />;
  }

  componentDidMount() {
    // show modal to create a page
    $('#shortcuts-modal').modal('toggle');
    return null;
  }

  render() {
    return (
      <React.Fragment>
      </React.Fragment>
    );
  }

}
