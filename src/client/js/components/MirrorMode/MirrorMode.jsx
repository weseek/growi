import React from 'react';


/**
 * Page staff credit component
 *
 * @export
 * @class StaffCredit
 * @extends {React.Component}
 */

export default class MirrorMode extends React.Component {


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
