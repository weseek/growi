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
        // construct members elements
        const members = contributor.members.map((member) => {
          return (
            <div className={contributor.memberAdditionalClass} key={`${member.name}-container`}>
              <span className="dev-position" key={`${member.name}-position`}>
                {/* position or '&nbsp;' */}
                { member.position || '\u00A0' }
              </span>
              <p className="dev-name" key={member.name}>{member.name}</p>
            </div>
          );
        });
        return (
          <React.Fragment key={`${contributor.sectionName}-fragment`}>
            <div className={`row ${contributor.sectionAdditionalClass}`} key={`${contributor.sectionName}-row`}>
              { !contributor.hideSectionName && (
                <h2 className="col-md-12 dev-team mt-5 staff-credit-mb-10" key={contributor.sectionName}>{contributor.sectionName}</h2>
              ) }
              {members}
            </div>
            <div className="clearfix"></div>
          </React.Fragment>
        );
      });
      return (
        <div className="text-center credit-curtain" onClick={this.deleteCredit}>
          <div className="credit-body">
            <h1 className="staff-credit-mb-10">Growi Staff Credits</h1>
            <div className="clearfix"></div>
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
