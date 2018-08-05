import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class PageStatusAlert
 * @extends {React.Component}
 */

class PageStatusAlert extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      initialRevisionId: this.props.revisionId,
      revisionId: this.props.revisionId,
      revisionIdHackmdSynced: this.props.revisionIdHackmdSynced,
      lastUpdateUsername: undefined,
      hasDraftOnHackmd: this.props.hasDraftOnHackmd,
      isDraftUpdatingInRealtime: false,
    };

    this.renderSomeoneEditingAlert = this.renderSomeoneEditingAlert.bind(this);
    this.renderDraftExistsAlert = this.renderDraftExistsAlert.bind(this);
    this.renderUpdatedAlert = this.renderUpdatedAlert.bind(this);
  }

  /**
   * clear status (invoked when page is updated by myself)
   */
  clearStatus(updatedRevisionId, updatedRevisionIdHackmdSynced) {
    this.setState({
      initialRevisionId: updatedRevisionId,
      revisionId: updatedRevisionId,
      revisionIdHackmdSynced: updatedRevisionIdHackmdSynced,
      hasDraftOnHackmd: false,
      isDraftUpdatingInRealtime: false,
    });
  }

  setRevisionId(revisionId, revisionIdHackmdSynced) {
    this.setState({ revisionId, revisionIdHackmdSynced });
  }

  setLastUpdateUsername(lastUpdateUsername) {
    this.setState({ lastUpdateUsername });
  }

  setHasDraftOnHackmd(hasDraftOnHackmd) {
    this.setState({
      hasDraftOnHackmd,
      isDraftUpdatingInRealtime: true,
    });
  }

  renderSomeoneEditingAlert() {
    return (
      <div className="alert-hackmd-someone-editing myadmin-alert alert-success myadmin-alert-bottom alertbottom2">
        <i className="icon-fw icon-people"></i>
        Someone editing this page on HackMD
        &nbsp;
        <i className="fa fa-angle-double-right"></i>
        &nbsp;
        <a href="#hackmd">
          Open HackMD Editor
        </a>
      </div>
    );
  }

  renderDraftExistsAlert(isRealtime) {
    return (
      <div className="alert-hackmd-draft-exists myadmin-alert alert-success myadmin-alert-bottom alertbottom2">
        <i className="icon-fw icon-pencil"></i>
        This page has a draft on HackMD
        &nbsp;
        <i className="fa fa-angle-double-right"></i>
        &nbsp;
        <a href="#hackmd">
          Open HackMD Editor
        </a>
      </div>
    );
  }

  renderUpdatedAlert() {
    const { t } = this.props;
    const label1 = t('edited this page');
    const label2 = t('Load latest');

    return (
      <div className="alert-revision-outdated myadmin-alert alert-warning myadmin-alert-bottom alertbottom2">
        <i className="icon-fw icon-bulb"></i>
        {this.state.lastUpdateUsername} {label1}
        &nbsp;
        <i className="fa fa-angle-double-right"></i>
        &nbsp;
        <a href="javascript:location.reload();">
          {label2}
        </a>
      </div>
    );
  }

  render() {
    let content = <React.Fragment></React.Fragment>;

    const isRevisionOutdated = this.state.initialRevisionId !== this.state.revisionId;
    const isHackmdDocumentOutdated = this.state.revisionId !== this.state.revisionIdHackmdSynced;

    if (isHackmdDocumentOutdated) {
      if (isRevisionOutdated) {
        content = this.renderUpdatedAlert();
      }
    }
    else {
      if (this.state.isDraftUpdatingInRealtime) {
        content = this.renderSomeoneEditingAlert();
      }
      else if (this.state.hasDraftOnHackmd) {
        content = this.renderDraftExistsAlert();
      }
    }

    return content;
  }
}

PageStatusAlert.propTypes = {
  t: PropTypes.func.isRequired,               // i18next
  crowi: PropTypes.object.isRequired,
  hasDraftOnHackmd: PropTypes.bool.isRequired,
  revisionId: PropTypes.string,
  revisionIdHackmdSynced: PropTypes.string,
};

PageStatusAlert.defaultProps = {
};

export default translate()(PageStatusAlert);
