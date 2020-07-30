import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import OutsideShareLinkModal from '../OutsideShareLinkModal';

import { toastError } from '../../util/apiNotification';


const PageShareManagement = (props) => {
  const { t, appContainer, pageContainer } = props;

  const { currentUser } = appContainer;

  const [isOutsideShareLinkModalShown, setIsOutsideShareLinkModalShown] = useState(false);

  function openOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(true);
  }

  function closeOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(false);
  }

  async function exportPageHundler(type) {
    const { pageId, revisionId } = pageContainer.state;
    try {
      // TODO GW-3062 現状では pdf ファイル形式の場合空のデータがダウンロードされるので要修正
      const responseType = type === 'pdf' ? 'arraybuffer' : 'json';
      const axios = require('axios').create({
        headers: {
          'Content-Type': 'application/pdf',
        },
        responseType: 'arraybuffer',
      });

      const data = await axios.get('/_api/v3/page/export', {
      // const data = await appContainer.apiv3Get('/page/export',
        params:
          {
            pageId,
            revisionId,
            type,
          },
      });
      console.log(data.data);
      const blobType = type === 'pdf' ? 'application/pdf' : 'application/json';
      const blob = new Blob(
        [data.data],
        { type: blobType },
      );
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${pageId}.${type}`;
      link.click();
      link.remove();
    }
    catch (err) {
      toastError(Error(t('export_bulk.failed_to_export')));
    }
  }

  function renderModals() {
    return (
      <>
        <OutsideShareLinkModal
          isOpen={isOutsideShareLinkModalShown}
          onClose={closeOutsideShareLinkModalHandler}
        />
      </>
    );
  }

  function renderCurrentUser() {
    return (
      <>
        <button
          type="button"
          className="btn-link nav-link bg-transparent dropdown-toggle dropdown-toggle-no-caret"
          data-toggle="dropdown"
        >
          <i className="icon-share"></i>
        </button>
      </>
    );
  }

  function renderGuestUser() {
    return (
      <>
        <button
          type="button"
          className="btn nav-link bg-transparent dropdown-toggle dropdown-toggle-no-caret disabled"
          id="auth-guest-tltips"
        >
          <i className="icon-share"></i>
        </button>
        <UncontrolledTooltip placement="top" target="auth-guest-tltips">
          {t('Not available for guest')}
        </UncontrolledTooltip>
      </>
    );
  }


  return (
    <>
      {currentUser == null ? renderGuestUser() : renderCurrentUser()}
      <div className="dropdown-menu dropdown-menu-right">
        <button className="dropdown-item" type="button" onClick={openOutsideShareLinkModalHandler}>
          <i className="icon-fw icon-link"></i>{t('Shere this page link to public')}
          <span className="ml-2 badge badge-info badge-pill">{pageContainer.state.shareLinksNumber}</span>
        </button>
        <button type="button" className="dropdown-item" onClick={() => { exportPageHundler('md') }}>
          <span>{t('export_bulk.export_page_markdown')}</span>
        </button>
        <button type="button" className="dropdown-item" onClick={() => { exportPageHundler('pdf') }}>
          <span>{t('export_bulk.export_page_pdf')}</span>
        </button>
      </div>
      {renderModals()}
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const PageShareManagementWrapper = withUnstatedContainers(PageShareManagement, [AppContainer, PageContainer]);


PageShareManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageShareManagementWrapper);
