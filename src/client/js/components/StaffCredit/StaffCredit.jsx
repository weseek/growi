import React from 'react';

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
    const credit = contributors.map((contributor) => {
      // construct members elements
      const memberGroups = contributor.memberGroups.map((memberGroup, idx) => {
        return this.renderMembers(memberGroup, `${contributor.sectionName}-group${idx}`);
      });
      return (
        <React.Fragment key={`${contributor.sectionName}-fragment`}>
          <div className={`row staff-credit-my-10 ${contributor.additionalClass}`} key={`${contributor.sectionName}-row`}>
            <h2 className="col-md-12 dev-team mt-5 staff-credit-mb-10" key={contributor.sectionName}>{contributor.sectionName}</h2>
            {memberGroups}
          </div>
          <div className="clearfix"></div>
        </React.Fragment>
      );
    });
    return (
      <div className="text-center credit-curtain" onClick={this.props.deleteCredit}>
        <div className="credit-body">
          <h1 className="staff-credit-mb-10">GROWI Contributors</h1>
          <div className="clearfix"></div>
          {credit}
        </div>
      </div>
    );
    return null;
  }

  render() {
    return (
      <React.Fragment>
        { this.renderContributors() }
      </React.Fragment>
    );
  }

}

StaffCredit.propTypes = {
};
