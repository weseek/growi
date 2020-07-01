import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import OutsideShareLinkModal from '../OutsideShareLinkModal';

import { toastError } from '../../util/apiNotification';

import ArchiveCreateModal from '../ArchiveCreateModal';

const PageShareManagement = (props) => {
  const { t, appContainer, pageContainer } = props;

  const { path, pageId } = pageContainer.state;
  const { currentUser } = appContainer;

  const [isOutsideShareLinkModalShown, setIsOutsideShareLinkModalShown] = useState(false);

  const [isArchiveCreateModalShown, setIsArchiveCreateModalShown] = useState(false);

  function openOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(true);
  }

  function closeOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(false);
  }


  async function getExportPageFile(type) {
    const pageId = pageContainer.state.pageId;
    try {
      const res = await appContainer.apiv3Get('/pages/export', { pageId, type });
      return res;
    }
    catch (err) {
      toastError(Error(t('export_bulk.failed_to_export')));
    }
  }

  async function getArchivePageData() {
    try {
      await appContainer.apiv3Get('page/archive', { pageId });
    }
    catch (e) {
      toastError(e);
    }
  }

  function exportArchive(exportArchiveData) {
  }

  function exportPage(exportPageFile) {
    // TODO implement
  }

  function exportPageHundler(type) {
    const exportPageFile = getExportPageFile(type);
    exportPage(exportPageFile);
  }

  function openArchiveModalHandler() {
    setIsArchiveCreateModalShown(true);

    const exportArchiveData = getArchivePageData();
    exportArchive(exportArchiveData);
  }

  function closeArchiveCreateModalHandler() {
    setIsArchiveCreateModalShown(false);
  }


  function renderModals() {
    return (
      <>
        <OutsideShareLinkModal
          isOpen={isOutsideShareLinkModalShown}
          onClose={closeOutsideShareLinkModalHandler}
        />

        <ArchiveCreateModal
          isOpen={isArchiveCreateModalShown}
          onClose={closeArchiveCreateModalHandler}
          path={path}
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
          <i className="icon-fw icon-link"></i>
          {t('Shere this page link to public')}
          <span className="ml-2 badge badge-info badge-pill">{pageContainer.state.shareLinksNumber}</span>
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => {
            exportPageHundler('markdown');
          }}
        >
          <span>{t('export_bulk.export_page_markdown')}</span>
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => {
            exportPageHundler('pdf');
          }}
        >
          <span>{t('export_bulk.export_page_pdf')}</span>
        </button>

        <button className="dropdown-item" type="button" onClick={openArchiveModalHandler}>
          <i className="icon-fw"></i>{t('Create Archive Page')}
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
