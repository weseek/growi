import React from 'react';
import { GlobalHotKeys } from 'react-hotkeys';

import loggerFactory from '@alias/logger';

/**
 * Page staff credit component
 *
 * @export
 * @class StaffCredit
 * @extends {React.Component}
 */

export default class MirrorMode extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

      userCommand: [],
    };
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
