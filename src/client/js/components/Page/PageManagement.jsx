import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { isTopPage } from '@commons/util/path-utils';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import PageDeleteModal from '../PageDeleteModal';
import PageRenameModal from '../PageRenameModal';
import PageDuplicateModal from '../PageDuplicateModal';
import CreateTemplateModal from '../CreateTemplateModal';


const PageManagement = (props) => {
  const { t, appContainer, pageContainer } = props;
  const {
    path, isDeletable, isAbleToDeleteCompletely,
  } = pageContainer.state;

  const { currentUser } = appContainer;
  const isTopPagePath = isTopPage(path);
  const [isPageRenameModalShown, setIsPageRenameModalShown] = useState(false);
  const [isPageDuplicateModalShown, setIsPageDuplicateModalShown] = useState(false);
  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);
  const [isPageDeleteModalShown, setIsPageDeleteModalShown] = useState(false);
  const [duplicateModalPaths, setDuplicateModalPaths] = useState([]);
  const [duplicateError, setDuplicateError] = useState(null);

  function openPageRenameModalHandler() {
    setIsPageRenameModalShown(true);
  }

  function closePageRenameModalHandler() {
    setIsPageRenameModalShown(false);
  }

  async function openPageDuplicateModalHandler() {
    setIsPageDuplicateModalShown(true);
    try {
      const res = await appContainer.apiv3Get('/pages/duplicate', { path });
      setDuplicateModalPaths(res.data.resultPaths);
    }
    catch (err) {
      setDuplicateError(t('modal_duplicate.label.Fail to get subordinated pages'));
    }
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
          pageDuplicateModalPaths={duplicateModalPaths}
          duplicateError={duplicateError}
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
