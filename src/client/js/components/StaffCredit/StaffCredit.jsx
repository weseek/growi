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
      isShow: false,
      userCommand: [],
    };
    this.konamiCommand = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', '5', '7', '3'];
  }

  @keydown('enter', 'up', 'down', 'right', 'left', '5', '7', '3')
  check(event) {
    if (this.konamiCommand[this.state.userCommand.length] === event.key) {
      const nextValue = this.state.userCommand.concat(event.key);
      // 最後のコナミコマンドならuserCommandをカラにしてコンポーネントを表示
      if (nextValue.length === this.konamiCommand.length) {
        this.setState({
          isShow: true,
          userCommand: [],
        });
        // クレジットが流れ終わるタイミングでコンポーネントを削除
        (async() => {
          const delay = (time) => { return new Promise((res) => { return setTimeout(() => { return res() }, time) }) };
          await delay(15 * 1000);
          this.deleteCredit();
        })();
      }
      // 入力されたコマンドがコナミコマンドの次のコマンドならuserCommandに追加
      else {
        this.setState({ userCommand: nextValue });
      }
    }
    else {
      this.state.userCommand = [];
    }
  }

  deleteCredit() {
    if (this.state.isShow) {
      this.setState({ isShow: false });
    }
  }

  render() {
    if (this.state.isShow) {
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
