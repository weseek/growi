import React from 'react';
import keydown from 'react-keydown';
import contributors from './Contributor';

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
      this.setState({ userCommand: [] });
    }
  }

  deleteCredit() {
    if (this.state.isShown) {
      this.setState({ isShown: false });
    }
  }

  render() {
    if (!this.state.isShown) {
      const credit = contributors.map((contributor) => {
        const section = <p key={contributor.sectionName} className="dev-team my-5">{contributor.sectionName}</p>;
        const members = contributor.members.map((member) => {
          const name = <p className="dev-name mb-5">{member.name}</p>;
          if (member.position) {
            return (
              <React.Fragment>
                <span className="dev-position">{member.position}</span>
                {name}
              </React.Fragment>
            );
          }
          return name;
        });
        return (
          <React.Fragment key={contributor.sectionName}>
            <div className={contributor.additionalClass}>
              {section}
              {members}
            </div>
          </React.Fragment>
        );
      });
      return (
        <div className="text-center credit-curtain" onClick={this.deleteCredit}>
          <div className="credit-body">
            <p className="title my-5">Growi Contributor</p>
            {credit}
          </div>
        </div>
      );
    }
    return null;
  }

}

StaffCredit.propTypes = {
};
