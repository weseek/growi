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

  async function getExportPageFile(type) {
    const { revisionId } = pageContainer.state;
    try {
      const res = await appContainer.apiv3Get('/pages/export', {
        revisionId, type,
      });

      return res.data.exportPageFile;
    }
    catch (err) {
      toastError(Error(t('export_bulk.failed_to_export')));
    }
  }

  function exportPage(exportPageFile, type) {
    const { pageId } = pageContainer.state;
    const blob = new Blob(
      [exportPageFile],
      { type: type === 'md' ? 'text/markdown' : 'application/pdf' },
    );
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${pageId}.${type}`;
    link.click();
  }

  async function exportPageHundler(type) {
    const exportPageFile = await getExportPageFile(type);
    await exportPage(exportPageFile, type);
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
