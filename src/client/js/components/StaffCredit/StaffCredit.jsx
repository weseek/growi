import React from 'react';
import { HotKeys } from 'react-hotkeys';

import loggerFactory from '@alias/logger';

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

    this.logger = loggerFactory('growi:StaffCredit');

    this.state = {
      isShown: false,
      userCommand: [],
    };
    this.konamiCommand = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    this.deleteCredit = this.deleteCredit.bind(this);
  }

  check(event) {
    this.logger.debug(`'${event.key}' pressed`);

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

        this.logger.debug('userCommand', this.state.userCommand);
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

  renderContributors() {
    if (this.state.isShown) {
      const credit = contributors.map((contributor) => {
        const section = <p key={contributor.sectionName} className="dev-team my-5">{contributor.sectionName}</p>;
        const members = contributor.members.map((member) => {
          const name = <p className="dev-name mb-5" key={member.name}>{member.name}</p>;
          if (member.position) {
            return (
              <React.Fragment key={member.position}>
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

  render() {
    const keyMap = { check: ['up', 'down', 'right', 'left', 'b', 'a'] };
    const handlers = { check: (event) => { return this.check(event) } };
    return (
      <HotKeys focused attach={window} keyMap={keyMap} handlers={handlers}>
        {this.renderContributors()}
      </HotKeys>
    );
  }

}

StaffCredit.propTypes = {
};
