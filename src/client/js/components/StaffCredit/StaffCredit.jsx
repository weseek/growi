import React from 'react';
import { GlobalHotKeys } from 'react-hotkeys';

import loggerFactory from '@alias/logger';
import {
  Modal, ModalBody,
} from 'reactstrap';

import contributors from './Contributor';

// Unit is px / milli sec
const scrollSpeed = 0.3;

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
        const target = $('.credit-curtain');
        const scrollTargetHeight = target.children().innerHeight();
        const duration = scrollTargetHeight / scrollSpeed;
        target.animate({ scrollTop: scrollTargetHeight }, duration, 'linear');
        target.slimScroll({
          height: target.innerHeight(),
          start: 'bottom',
          color: '#FFFFFF',
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

  renderMembers(memberGroup, keyPrefix) {
    // construct members elements
    const members = memberGroup.members.map((member) => {
      return (
        <div className={memberGroup.additionalClass} key={`${keyPrefix}-${member.name}-container`}>
          <span className="dev-position" key={`${keyPrefix}-${member.name}-position`}>
            {/* position or '&nbsp;' */}
            { member.position || '\u00A0' }
          </span>
          <p className="dev-name" key={`${keyPrefix}-${member.name}`}>{member.name}</p>
        </div>
      );
    });
    return (
      <React.Fragment key={`${keyPrefix}-fragment`}>
        {members}
      </React.Fragment>
    );
  }

  renderContributors() {
    if (this.state.isShown) {
      const credit = contributors.map((contributor) => {
        // construct members elements
        const memberGroups = contributor.memberGroups.map((memberGroup, idx) => {
          return this.renderMembers(memberGroup, `${contributor.sectionName}-group${idx}`);
        });
        return (
          <React.Fragment key={`${contributor.sectionName}-fragment`}>
            <div className={`row ${contributor.additionalClass}`} key={`${contributor.sectionName}-row`}>
              <h2 className="col-md-12 dev-team mt-5 staff-credit-mb-10" key={contributor.sectionName}>{contributor.sectionName}</h2>
              {memberGroups}
            </div>
            <div className="clearfix"></div>
          </React.Fragment>
        );
      });
      return (
        <div className="text-center staff-credit-pb-10" onClick={this.deleteCredit}>
          <h1 className="staff-credit-mb-10">GROWI Contributors</h1>
          <div className="clearfix"></div>
          {credit}
        </div>
      );
    }
    return null;
  }

  render() {
    const keyMap = { check: ['up', 'down', 'right', 'left', 'b', 'a'] };
    const handlers = { check: (event) => { return this.check(event) } };
    return (
      <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
        <Modal isOpen={this.state.isShown} toggle={this.deleteCredit} scrollable className="staff-credit">
          <ModalBody className="credit-curtain">
            {this.renderContributors()}
          </ModalBody>
        </Modal>
      </GlobalHotKeys>
    );
  }

}

StaffCredit.propTypes = {
};
