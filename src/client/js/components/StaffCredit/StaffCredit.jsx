import React from 'react';
import keydown from 'react-keydown';

/**
 * Page staff credit component
 *
 * @export
 * @class StaffCredit
 * @extends {React.Component}
 */

export default class StaffCredit extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      userCommand: [],
    };
    this.konamiCommand = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', '5', '7', '3'];
  }

  @keydown('enter', 'up', 'down', 'right', 'left', '5', '7', '3')
  check(event) {
    if (this.konamiCommand[this.state.userCommand.length] === event.key) {
      this.setState({ userCommand: this.state.userCommand.concat(event.key) });
    }
    else {
      this.state.userCommand = [];
    }
  }

  render() {
    const isRender = this.state.userCommand.length === this.konamiCommand.length;
    if (isRender) {
      return (
        <div className="text-center credit-curtain">
          <div className="credit-body">
            <p className="title my-5">Growi Soncho</p>
            <span className="dev-position">1st</span>
            <p className="dev-name mb-5">Sou Mizobuchi</p>
            <span className="dev-position">2nd</span>
            <p className="dev-name mb-5">Yusuke Takizawa</p>
          </div>
        </div>
      );
    }
    return null;
  }

}

StaffCredit.propTypes = {
};
