import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { isTopPage } from '@commons/util/path-utils';
import { createSubscribedElement } from '../UnstatedUtils';
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
        <a className="dropdown-item" type="button" onClick={openPageRenameModalHandler}>
          <i className="icon-fw icon-action-redo"></i> { t('Move/Rename') }
        </a>
        <a className="dropdown-item" type="button" onClick={openPageDuplicateModalHandler}>
          <i className="icon-fw icon-docs"></i> { t('Duplicate') }
        </a>
        <div className="dropdown-divider"></div>
      </>
    );
  }

  function renderDropdownItemForDeletablePage() {
    return (
      <>
        <div className="dropdown-divider"></div>
        <a className="dropdown-item" type="button" onClick={openPageDeleteModalHandler}>
          <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
        </a>
      </>
    );
  }

  function renderModals() {
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

  return (
    <>
      <a
        role="button"
        className={`nav-link dropdown-toggle dropdown-toggle-no-caret ${currentUser == null && 'dropdown-toggle-disabled'}`}
        href="#"
        data-toggle={`${currentUser == null ? 'tooltip' : 'dropdown'}`}
        data-placement="top"
        data-container="body"
        title={t('Not available for guest')}
      >
        <i className="icon-options-vertical"></i>
      </a>
      <div className="dropdown-menu dropdown-menu-right">
        {!isTopPagePath && renderDropdownItemForNotTopPage()}
        <a className="dropdown-item" onClick={openPageTemplateModalHandler}>
          <i className="icon-fw icon-magic-wand"></i> { t('template.option_label.create/edit') }
        </a>
        {(!isTopPagePath && isDeletable) && renderDropdownItemForDeletablePage()}
      </div>
      {renderModals()}
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const PageManagementWrapper = (props) => {
  return createSubscribedElement(PageManagement, props, [AppContainer, PageContainer]);
};


PageManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageManagementWrapper);
