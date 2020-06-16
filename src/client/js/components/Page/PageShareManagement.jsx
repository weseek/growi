import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import OutsideShareLinkModal from '../OutsideShareLinkModal';
import ArchiveCreateModal from '../ArchiveCreateModal';

const PageShareManagement = (props) => {
  const { t, appContainer, pageContainer } = props;

  const { currentUser } = appContainer;

  const [isOutsideShareLinkModalShown, setIsOutsideShareLinkModalShown] = useState(false);

  const [isArchiveCreateModalShown, setIsArchiveCreateModalShown] = useState(false);

  function openOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(true);
  }

  function closeOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(false);
  }

  function openArchiveModalHandler() {
    console.log('ログ出るで！');
    setIsArchiveCreateModalShown(true);
  }

  function closeArchiveCreateModalHandler() {
    console.log('ログ閉じるで！');
    setIsArchiveCreateModalShown(false);
  }


  function renderModals() {
    return (
      <OutsideShareLinkModal
        isOpen={isOutsideShareLinkModalShown}
        onClose={closeOutsideShareLinkModalHandler}
      />
    );
  }

  function renderArchiveModals() {
    return (
      <ArchiveCreateModal
        isOpen={isArchiveCreateModalShown}
        onClose={closeArchiveCreateModalHandler}
      />
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

        <button className="dropdown-item" type="button" onClick={openArchiveModalHandler}>アーカイブデータを作成する
        </button>

      </div>
      {renderModals()}
      {renderArchiveModals()}
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
