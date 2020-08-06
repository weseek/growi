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

  const [totalPages, setTotalPages] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);

  function openOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(true);
  }

  function closeOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(false);
  }

  async function getMarkdown() {
    const { revisionId } = pageContainer.state;
    try {
      const res = await appContainer.apiv3Get('/page/export', { revisionId });
      return res.data.markdown;
    }
    catch (err) {
      toastError(Error(t('export_bulk.failed_to_export')));
    }
  }

  async function getArchivePageData() {
    try {
      const res = await appContainer.apiv3Get('page/count-children-pages', { pageId });
      setTotalPages(res.data.dummy);
    }
    catch (err) {
      setErrorMessage(t('export_bulk.failed_to_count_pages'));
    }
  }

  function exportPage(exportPageFile) {
    // TODO implement
  }

  async function exportPageHundler(type) {
    const markdown = await getMarkdown();
    await exportPage(markdown, type);
  }

  function openArchiveModalHandler() {
    setIsArchiveCreateModalShown(true);
    getArchivePageData();
  }


  function closeArchiveCreateModalHandler() {
    setIsArchiveCreateModalShown(false);
  }


  function renderModals() {
    if (currentUser == null) {
      return null;
    }

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
          errorMessage={errorMessage}
          totalPages={totalPages}
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
          <i className="icon-fw icon-link"></i>{t('share_links.Shere this page link to public')}
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
