import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import { createSubscribedElement } from './UnstatedUtils';

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
    };

    this.renderSomeoneEditingAlert = this.renderSomeoneEditingAlert.bind(this);
    this.renderDraftExistsAlert = this.renderDraftExistsAlert.bind(this);
    this.renderUpdatedAlert = this.renderUpdatedAlert.bind(this);
  }

  componentWillMount() {
    this.props.appContainer.registerComponentInstance('PageStatusAlert', this);
  }

  refreshPage() {
    window.location.reload();
  }

  renderSomeoneEditingAlert() {
    const { t } = this.props;
    return (
      <div className="alert-hackmd-someone-editing alert alert-success fixed-bottom p-3 mb-0">
        <i className="icon-fw icon-people"></i>
        {t('hackmd.someone_editing')}
        &nbsp;
        <i className="fa fa-angle-double-right"></i>
        &nbsp;
        <a href="#hackmd" className="font-weight-bold text-decoration-none">
          <u>Open HackMD Editor</u>
        </a>
      </div>
    );
  }

  renderDraftExistsAlert(isRealtime) {
    const { t } = this.props;
    return (
      <div className="alert-hackmd-draft-exists alert alert-success fixed-bottom p-3 mb-0">
        <i className="icon-fw icon-pencil"></i>
        {t('hackmd.this_page_has_draft')}
        &nbsp;
        <i className="fa fa-angle-double-right"></i>
        &nbsp;
        <a href="#hackmd" className="font-weight-bold text-decoration-none">
          <u>Open HackMD Editor</u>
        </a>
      </div>
    );
  }

  renderUpdatedAlert() {
    const { t } = this.props;
    const label1 = t('edited this page');
    const label2 = t('Load latest');

    return (
      <div className="alert alert-warning fixed-bottom p-3 mb-0">
        <i className="icon-fw icon-bulb"></i>
        {this.props.pageContainer.state.lastUpdateUsername} {label1}
        &nbsp;
        <i className="fa fa-angle-double-right"></i>
        &nbsp;
        <a href="#" onClick={this.refreshPage} className="font-weight-bold text-decoration-none">
          <u>{label2}</u>
        </a>
      </div>
    );
  }

  render() {
    let content = <React.Fragment></React.Fragment>;

    const {
      revisionId, revisionIdHackmdSynced, remoteRevisionId, hasDraftOnHackmd, isHackmdDraftUpdatingInRealtime,
    } = this.props.pageContainer.state;

    const isRevisionOutdated = revisionId !== remoteRevisionId;
    const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

    // when remote revision is newer than both
    if (isHackmdDocumentOutdated && isRevisionOutdated) {
      content = this.renderUpdatedAlert();
    }
    // when someone editing with HackMD
    else if (isHackmdDraftUpdatingInRealtime) {
      content = this.renderSomeoneEditingAlert();
    }
    // when the draft of HackMD is newest
    else if (hasDraftOnHackmd) {
      content = this.renderDraftExistsAlert();
    }

    return content;
  }

}

/**
 * Wrapper component for using unstated
 */
const PageStatusAlertWrapper = (props) => {
  return createSubscribedElement(PageStatusAlert, props, [AppContainer, PageContainer]);
};

PageStatusAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageStatusAlertWrapper);
