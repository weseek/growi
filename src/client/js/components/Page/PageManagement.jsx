import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';

import { isTopPage } from '~/utils/path-utils';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import PageDeleteModal from '../PageDeleteModal';
import PageRenameModal from '../PageRenameModal';
import PageDuplicateModal from '../PageDuplicateModal';
import CreateTemplateModal from '../CreateTemplateModal';


const PageManagement = (props) => {
  const { t, appContainer, pageContainer } = props;
  const { path, isDeletable, isAbleToDeleteCompletely } = pageContainer.state;

  const { currentUser } = appContainer;
  const isTopPagePath = isTopPage(path);

  const [isPageRenameModalShown, setIsPageRenameModalShown] = useState(false);
  const [isPageDuplicateModalShown, setIsPageDuplicateModalShown] = useState(false);
  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);
  const [isPageDeleteModalShown, setIsPageDeleteModalShown] = useState(false);

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


  function renderDropdownItemForNotTopPage() {
    return (
      <>
        <button className="dropdown-item" type="button" onClick={openPageRenameModalHandler}>
          <i className="icon-fw icon-action-redo"></i> { t('Move/Rename') }
        </button>
        <button className="dropdown-item" type="button" onClick={openPageDuplicateModalHandler}>
          <i className="icon-fw icon-docs"></i> { t('Duplicate') }
        </button>
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
      </>
    );
  }

  function renderDotsIconForCurrentUser() {
    return (
      <>
        <button
          type="button"
          className="btn-link nav-link bg-transparent dropdown-toggle dropdown-toggle-no-caret"
          data-toggle="dropdown"
        >
          <i className="icon-options-vertical"></i>
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
          <i className="icon-options-vertical"></i>
        </button>
        <UncontrolledTooltip placement="top" target="icon-options-guest-tltips">
          {t('Not available for guest')}
        </UncontrolledTooltip>
      </>
    );
  }


  return (
    <>
      {currentUser == null ? renderDotsIconForGuestUser() : renderDotsIconForCurrentUser()}
      <div className="dropdown-menu dropdown-menu-right">
        {!isTopPagePath && renderDropdownItemForNotTopPage()}
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
