/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Subscribe } from 'unstated';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

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
    this.props.appContainer.registerComponentInstance(this);
  }

  refreshPage() {
    window.location.reload();
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
        {this.props.pageContainer.state.lastUpdateUsername} {label1}
        &nbsp;
        <i className="fa fa-angle-double-right"></i>
        &nbsp;
        <a onClick={this.refreshPage}>
          {label2}
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
class PageStatusAlertWrapper extends React.Component {

  render() {
    return (
      <Subscribe to={[AppContainer, PageContainer]}>
        { (appContainer, pageContainer) => (
          // eslint-disable-next-line arrow-body-style
          <PageStatusAlert appContainer={appContainer} pageContainer={pageContainer} {...this.props} />
        )}
      </Subscribe>
    );
  }

}

PageStatusAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

PageStatusAlertWrapper.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation(null, { withRef: true })(PageStatusAlertWrapper);
