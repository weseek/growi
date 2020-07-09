import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import { withUnstatedContainers } from './UnstatedUtils';

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

  refreshPage() {
    window.location.reload();
  }

  renderSomeoneEditingAlert() {
    const { t } = this.props;
    return (
      <div className="card grw-page-status-alert text-white text-center bg-success d-hackmd-none fixed-bottom">
        <div className="card-body">
          <p className="card-text">
            <i className="icon-fw icon-people"></i>
            {t('hackmd.someone_editing')}
          </p>
          <p className="card-text">
            <a href="#hackmd" className="btn btn-lg btn-outline-white">
              <i className="fa fa-fw fa-file-text-o"></i>
              Open HackMD Editor
            </a>
          </p>
        </div>
      </div>
    );
  }

  renderDraftExistsAlert(isRealtime) {
    const { t } = this.props;
    return (
      <div className="card grw-page-status-alert text-white text-center bg-success d-hackmd-none fixed-bottom">
        <div className="card-body">
          <p className="card-text">
            <i className="icon-fw icon-pencil"></i>
            {t('hackmd.this_page_has_draft')}
          </p>
          <p className="card-text">
            <a href="#hackmd" className="btn btn-lg btn-outline-white">
              <i className="fa fa-fw fa-file-text-o"></i>
              Open HackMD Editor
            </a>
          </p>
        </div>
      </div>
    );
  }

  renderUpdatedAlert() {
    const { t } = this.props;
    const label1 = t('edited this page');
    const label2 = t('Load latest');

    return (
      <div className="card grw-page-status-alert text-white text-center bg-warning fixed-bottom">
        <div className="card-body">
          <p className="card-text">
            <i className="icon-fw icon-bulb"></i>
            {this.props.pageContainer.state.lastUpdateUsername} {label1}
          </p>
          <p className="card-text">
            <a href="#" className="btn btn-lg btn-outline-white" onClick={this.refreshPage}>
              <i className="icon-fw icon-reload"></i>
              {label2}
            </a>
          </p>
        </div>
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
const PageStatusAlertWrapper = withUnstatedContainers(PageStatusAlert, [AppContainer, PageContainer]);

PageStatusAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageStatusAlertWrapper);
