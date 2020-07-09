import React from 'react';

/**
 *
 * @export
 * @extends {React.Component}
 */

export default class PageEdit extends React.Component {

  // when this is called it returns the hotkey stroke
  static getHotkeyStroke() {
    return {
      stroke: ['e'],
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
    };
  }

  static getComponent() {
    return <PageEdit />;
  }

  componentDidMount() {
    // ignore when dom that has 'modal in' classes exists
    if (document.getElementsByClassName('modal in').length > 0) {
      return;
    }
    // show editor
    $('a[data-toggle="tab"][href="#edit"]').tab('show');
    return null;
  }

  render() {
    return (
      <React.Fragment>
      </React.Fragment>
    );
  }

}
