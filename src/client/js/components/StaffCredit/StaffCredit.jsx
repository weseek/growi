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
      isShown: false,
      userCommand: [],
    };
    this.konamiCommand = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', '5', '7', '3'];
    this.deleteCredit = this.deleteCredit.bind(this);
  }

  @keydown('enter', 'up', 'down', 'right', 'left', '5', '7', '3')
  check(event) {
    // compare keydown and next konamiCommand
    if (this.konamiCommand[this.state.userCommand.length] === event.key) {
      const nextValue = this.state.userCommand.concat(event.key);
      if (nextValue.length === this.konamiCommand.length) {
        this.setState({
          isShown: true,
          userCommand: [],
        });
      }
      else {
        // add UserCommand
        this.setState({ userCommand: nextValue });
      }
    }
    else {
      // clear UserCommand
      this.state.userCommand = [];
    }
  }

  deleteCredit() {
    if (this.state.isShown) {
      this.setState({ isShown: false });
    }
  }

  render() {
    if (this.state.isShown) {
      return (
        <div className="text-center credit-curtain" onClick={this.deleteCredit}>
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
