import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';
import Username from '~/components/User/Username';

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

    this.getContentsForSomeoneEditingAlert = this.getContentsForSomeoneEditingAlert.bind(this);
    this.getContentsForDraftExistsAlert = this.getContentsForDraftExistsAlert.bind(this);
    this.getContentsForUpdatedAlert = this.getContentsForUpdatedAlert.bind(this);
    this.onClickResolveConflict = this.onClickResolveConflict.bind(this);
  }

  refreshPage() {
    window.location.reload();
  }

  onClickResolveConflict() {
    this.props.pageContainer.setState({
      isConflictDiffModalOpen: true,
    });
  }

  getContentsForSomeoneEditingAlert() {
    const { t } = this.props;
    return [
      ['bg-success', 'd-hackmd-none'],
      <>
        <i className="icon-fw icon-people"></i>
        {t('hackmd.someone_editing')}
      </>,
      <a href="#hackmd" key="btnOpenHackmdSomeoneEditing" className="btn btn-outline-white">
        <i className="fa fa-fw fa-file-text-o mr-1"></i>
        Open HackMD Editor
      </a>,
    ];
  }

  getContentsForDraftExistsAlert(isRealtime) {
    const { t } = this.props;
    return [
      ['bg-success', 'd-hackmd-none'],
      <>
        <i className="icon-fw icon-pencil"></i>
        {t('hackmd.this_page_has_draft')}
      </>,
      <a href="#hackmd" key="btnOpenHackmdPageHasDraft" className="btn btn-outline-white">
        <i className="fa fa-fw fa-file-text-o mr-1"></i>
        Open HackMD Editor
      </a>,
    ];
  }

  getContentsForUpdatedAlert() {
    const { t, appContainer, pageContainer } = this.props;
    const pageEditor = appContainer.getComponentInstance('PageEditor');

    let isConflictOnEdit = false;

    if (pageEditor != null) {
      const markdownOnEdit = pageEditor.getMarkdown();
      isConflictOnEdit = markdownOnEdit !== pageContainer.state.markdown;
    }

    // TODO: re-impl with Next.js way
    // const usernameComponentToString = ReactDOMServer.renderToString(<Username user={pageContainer.state.lastUpdateUser} />);

    // const label1 = isConflictOnEdit
    //   ? t('modal_resolve_conflict.file_conflicting_with_newer_remote')
    //   // eslint-disable-next-line react/no-danger
    //   : <span dangerouslySetInnerHTML={{ __html: `${usernameComponentToString} ${t('edited this page')}` }} />;
    const label1 = '(TBD -- 2022.09.13)';

    return [
      ['bg-warning'],
      <>
        <i className="icon-fw icon-bulb"></i>
        {label1}
      </>,
      <>
        <button type="button" onClick={() => this.refreshPage()} className="btn btn-outline-white mr-4">
          <i className="icon-fw icon-reload mr-1"></i>
          {t('Load latest')}
        </button>
        { isConflictOnEdit && (
          <button
            type="button"
            onClick={this.onClickResolveConflict}
            className="btn btn-outline-white"
          >
            <i className="fa fa-fw fa-file-text-o mr-1"></i>
            {t('modal_resolve_conflict.resolve_conflict')}
          </button>
        )}
      </>,
    ];
  }

  render() {
    const {
      revisionId, revisionIdHackmdSynced, remoteRevisionId, hasDraftOnHackmd, isHackmdDraftUpdatingInRealtime,
    } = this.props.pageContainer.state;

    const isRevisionOutdated = revisionId !== remoteRevisionId;
    const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

    let getContentsFunc = null;

    // when remote revision is newer than both
    if (isHackmdDocumentOutdated && isRevisionOutdated) {
      getContentsFunc = this.getContentsForUpdatedAlert;
    }
    // when someone editing with HackMD
    else if (isHackmdDraftUpdatingInRealtime) {
      getContentsFunc = this.getContentsForSomeoneEditingAlert;
    }
    // when the draft of HackMD is newest
    else if (hasDraftOnHackmd) {
      getContentsFunc = this.getContentsForDraftExistsAlert;
    }
    // do not render anything
    else {
      return null;
    }

    const [additionalClasses, label, btn] = getContentsFunc();

    return (
      <div className={`card grw-page-status-alert text-white fixed-bottom animated fadeInUp faster ${additionalClasses.join(' ')}`}>
        <div className="card-body">
          <p className="card-text grw-card-label-container">
            {label}
          </p>
          <p className="card-text grw-card-btn-container">
            {btn}
          </p>
        </div>
      </div>
    );
  }

}

PageStatusAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

const PageStatusAlertWrapperFC = (props) => {
  const { t } = useTranslation();
  return <PageStatusAlert t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const PageStatusAlertWrapper = withUnstatedContainers(PageStatusAlertWrapperFC, [AppContainer, PageContainer]);

export default PageStatusAlertWrapper;
