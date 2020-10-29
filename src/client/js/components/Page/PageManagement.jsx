import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import urljoin from 'url-join';

import { isTopPage } from '@commons/util/path-utils';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import PageDeleteModal from '../PageDeleteModal';
import PageRenameModal from '../PageRenameModal';
import PageDuplicateModal from '../PageDuplicateModal';
import CreateTemplateModal from '../CreateTemplateModal';
import PagePresentationModal from '../PagePresentationModal';
import PresentationIcon from '../Icons/PresentationIcon';


const PageManagement = (props) => {
  const { t, appContainer, pageContainer } = props;
  const { path, isDeletable, isAbleToDeleteCompletely } = pageContainer.state;

  const { currentUser } = appContainer;
  const isTopPagePath = isTopPage(path);

  const [isPageRenameModalShown, setIsPageRenameModalShown] = useState(false);
  const [isPageDuplicateModalShown, setIsPageDuplicateModalShown] = useState(false);
  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);
  const [isPageDeleteModalShown, setIsPageDeleteModalShown] = useState(false);
  const [isPagePresentationModalShown, setIsPagePresentationModalShown] = useState(false);

  function openPageRenameModalHandler() {
    setIsPageRenameModalShown(true);
  }

  function closePageRenameModalHandler() {
    setIsPageRenameModalShown(false);
  }

  function openPageDuplicateModalHandler() {
    setIsPageDuplicateModalShown(true);
  }

  function closePageDuplicateModalHandler() {
    setIsPageDuplicateModalShown(false);
  }

  function openPageTemplateModalHandler() {
    setIsPageTempleteModalShown(true);
  }

  function closePageTemplateModalHandler() {
    setIsPageTempleteModalShown(false);
  }

  function openPageDeleteModalHandler() {
    setIsPageDeleteModalShown(true);
  }

  function closePageDeleteModalHandler() {
    setIsPageDeleteModalShown(false);
  }

  function openPagePresentationModalHandler() {
    setIsPagePresentationModalShown(true);
  }

  function closePagePresentationModalHandler() {
    setIsPagePresentationModalShown(false);
  }


  // TODO GW-2746 bulk export pages
  // async function getArchivePageData() {
  //   try {
  //     const res = await appContainer.apiv3Get('page/count-children-pages', { pageId });
  //     setTotalPages(res.data.dummy);
  //   }
  //   catch (err) {
  //     setErrorMessage(t('export_bulk.failed_to_count_pages'));
  //   }
  // }

  async function exportPageHandler(format) {
    const { pageId, revisionId } = pageContainer.state;
    const url = new URL(urljoin(window.location.origin, '_api/v3/page/export', pageId));
    url.searchParams.append('format', format);
    url.searchParams.append('revisionId', revisionId);
    window.location.href = url.href;
  }

  // TODO GW-2746 create api to bulk export pages
  // function openArchiveModalHandler() {
  //   setIsArchiveCreateModalShown(true);
  //   getArchivePageData();
  // }

  // TODO GW-2746 create api to bulk export pages
  // function closeArchiveCreateModalHandler() {
  //   setIsArchiveCreateModalShown(false);
  // }

  function renderDropdownItemForTopPage() {
    return (
      <>
        <button className="dropdown-item" type="button" onClick={openPageDuplicateModalHandler}>
          <i className="icon-fw icon-docs"></i> { t('Duplicate') }
        </button>
        {/* TODO Presentation Mode is not function. So if it is really necessary, survey this cause and implement Presentation Mode in top page */}
        {/* <button className="dropdown-item" type="button" onClick={openPagePresentationModalHandler}>
          <i className="icon-fw"><PresentationIcon /></i><span className="d-none d-sm-inline"> { t('Presentation Mode') }</span>
        </button> */}
        <button type="button" className="dropdown-item" onClick={() => { exportPageHandler('md') }}>
          <i className="icon-fw icon-cloud-download"></i>{t('export_bulk.export_page_markdown')}
        </button>
        <div className="dropdown-divider"></div>
      </>
    );
  }

  function renderDropdownItemForNotTopPage() {
    return (
      <>
        <button className="dropdown-item" type="button" onClick={openPageRenameModalHandler}>
          <i className="icon-fw icon-action-redo"></i> { t('Move/Rename') }
        </button>
        <button className="dropdown-item" type="button" onClick={openPageDuplicateModalHandler}>
          <i className="icon-fw icon-docs"></i> { t('Duplicate') }
        </button>
        <button className="dropdown-item" type="button" onClick={openPagePresentationModalHandler}>
          <i className="icon-fw"><PresentationIcon /></i> { t('Presentation Mode') }
        </button>
        <button type="button" className="dropdown-item" onClick={() => { exportPageHandler('md') }}>
          <i className="icon-fw icon-cloud-download"></i>{t('export_bulk.export_page_markdown')}
        </button>
        {/* TODO GW-2746 create api to bulk export pages */}
        {/* <button className="dropdown-item" type="button" onClick={openArchiveModalHandler}>
          <i className="icon-fw"></i>{t('Create Archive Page')}
        </button> */}
        <div className="dropdown-divider"></div>
      </>
    );
  }

  function renderDropdownItemForDeletablePage() {
    return (
      <>
        <div className="dropdown-divider"></div>
        <button className="dropdown-item" type="button" onClick={openPageDeleteModalHandler}>
          <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
        </button>
      </>
    );
  }

  function renderModals() {
    if (currentUser == null) {
      return null;
    }

    return (
      <>
        <PageRenameModal
          isOpen={isPageRenameModalShown}
          onClose={closePageRenameModalHandler}
          path={path}
        />
        <PageDuplicateModal
          isOpen={isPageDuplicateModalShown}
          onClose={closePageDuplicateModalHandler}
        />
        <CreateTemplateModal
          isOpen={isPageTemplateModalShown}
          onClose={closePageTemplateModalHandler}
        />
        <PageDeleteModal
          isOpen={isPageDeleteModalShown}
          onClose={closePageDeleteModalHandler}
          path={path}
          isAbleToDeleteCompletely={isAbleToDeleteCompletely}
        />
        <PagePresentationModal
          isOpen={isPagePresentationModalShown}
          onClose={closePagePresentationModalHandler}
          href="?presentation=1"
        />
      </>
    );
  }

  function renderDotsIconForCurrentUser() {
    return (
      <>
        <button
          type="button"
          className="btn-link nav-link dropdown-toggle dropdown-toggle-no-caret border-0 rounded grw-btn-page-management"
          data-toggle="dropdown"
        >
          <i className="icon-options"></i>
        </button>
      </>
    );
  }

  function renderDotsIconForGuestUser() {
    return (
      <>
        <button
          type="button"
          className="btn nav-link bg-transparent dropdown-toggle dropdown-toggle-no-caret disabled"
          id="icon-options-guest-tltips"
        >
          <i className="icon-options"></i>
        </button>
        <UncontrolledTooltip placement="top" target="icon-options-guest-tltips" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      </>
    );
  }


  return (
    <>
      {currentUser == null ? renderDotsIconForGuestUser() : renderDotsIconForCurrentUser()}
      <div className="dropdown-menu dropdown-menu-right">
        {isTopPagePath ? renderDropdownItemForTopPage() : renderDropdownItemForNotTopPage()}
        <button className="dropdown-item" type="button" onClick={openPageTemplateModalHandler}>
          <i className="icon-fw icon-magic-wand"></i> { t('template.option_label.create/edit') }
        </button>
        {(!isTopPagePath && isDeletable) && renderDropdownItemForDeletablePage()}
      </div>
      {renderModals()}
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const PageManagementWrapper = withUnstatedContainers(PageManagement, [AppContainer, PageContainer]);


PageManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageManagementWrapper);
