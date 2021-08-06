import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalBody,
} from 'reactstrap';
import loggerFactory from '~/utils/logger';
import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

/**
 * Page staff credit component
 *
 * @export
 * @class StaffCredit
 * @extends {React.Component}
 */

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:cli:StaffCredit');

class StaffCredit extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      isShown: true,
      contributors: null,
    };
    this.deleteCredit = this.deleteCredit.bind(this);
  }

  // to delete the staffCredit and to inform that to Hotkeys.jsx
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
      const credit = this.state.contributors.map((contributor) => {
        // construct members elements
        const memberGroups = contributor.memberGroups.map((memberGroup, idx) => {
          return this.renderMembers(memberGroup, `${contributor.sectionName}-group${idx}`);
        });
        return (
          <React.Fragment key={`${contributor.sectionName}-fragment`}>
            <div className={`row ${contributor.additionalClass}`} key={`${contributor.sectionName}-row`}>
              <h2 className="col-md-12 dev-team staff-credit-mt-10rem staff-credit-mb-6rem" key={contributor.sectionName}>{contributor.sectionName}</h2>
              {memberGroups}
            </div>
            <div className="clearfix"></div>
          </React.Fragment>
        );
      });
      return (
        <div className="text-center staff-credit-content" onClick={this.deleteCredit}>
          <h1 className="staff-credit-mb-6rem">GROWI Contributors</h1>
          <div className="clearfix"></div>
          {credit}
        </div>
      );
    }
    return null;
  }

  async componentDidMount() {
    const res = await this.props.appContainer.apiv3Get('/staffs');
    const contributors = res.data.contributors;
    this.setState({ contributors });

    setTimeout(() => {
      // px / sec
      const scrollSpeed = 200;
      const target = $('.credit-curtain');
      const scrollTargetHeight = target.children().innerHeight();
      const duration = scrollTargetHeight / scrollSpeed * 1000;
      target.animate({ scrollTop: scrollTargetHeight }, duration, 'linear');
      target.slimScroll({
        height: target.innerHeight(),
        // Able to scroll after automatic schooling is complete so set "bottom" to allow scrolling from the bottom.
        start: 'bottom',
        color: '#FFFFFF',
      });
    }, 10);
  }

  render() {
    const { onClosed } = this.props;

    if (this.state.contributors === null) {
      return <></>;
    }

    return (
      <Modal
        isOpen={this.state.isShown}
        onClosed={() => {
          if (onClosed != null) {
            onClosed();
          }
        }}
        toggle={this.deleteCredit}
        scrollable
        className="staff-credit"
      >
        <ModalBody className="credit-curtain">
          {this.renderContributors()}
        </ModalBody>
      </Modal>
    );
  }

}

const StaffCreditWrapper = withUnstatedContainers(StaffCredit, [AppContainer]);

StaffCredit.propTypes = {
  onClosed: PropTypes.func,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default StaffCreditWrapper;
