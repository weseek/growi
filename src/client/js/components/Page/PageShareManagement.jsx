import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import urljoin from 'url-join';
import { withUnstatedContainers } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import OutsideShareLinkModal from '../OutsideShareLinkModal';

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

  async function getArchivePageData() {
    try {
      const res = await appContainer.apiv3Get('page/count-children-pages', { pageId });
      setTotalPages(res.data.dummy);
    }
    catch (err) {
      setErrorMessage(t('export_bulk.failed_to_count_pages'));
    }
  }

  async function exportPageHandler(format) {
    const { pageId, revisionId } = pageContainer.state;
    const url = new URL(urljoin(window.location.origin, '_api/v3/page/export', pageId));
    url.searchParams.append('format', format);
    url.searchParams.append('revisionId', revisionId);
    window.location.href = url.href;
  }

  // TODO GW-2746 create api to bulk export pages
  // eslint-disable-next-line no-unused-vars
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
        <button type="button" className="dropdown-item" onClick={() => { exportPageHandler('md') }}>
          <span>{t('export_bulk.export_page_markdown')}</span>
        </button>
        {/* TODO GW-2746 create api to bulk export pages */}
        {/* <button className="dropdown-item" type="button" onClick={openArchiveModalHandler}>
          <i className="icon-fw"></i>{t('Create Archive Page')}
        </button> */}
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
