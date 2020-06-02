import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { isTopPage } from '@commons/util/path-utils';
import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
/* import OutsideShareLinkModal from '../OutsideShareLinkModal'; */


const PageShareManagement = (props) => {
  const { t, appContainer, pageContainer } = props;
  const { path } = pageContainer.state;

  const { currentUser } = appContainer;
/*   const isTopPagePath = isTopPage(path); */

/*   const [isOutsideShareLinkModalShown, setIsOutsideShareLinkModalShown] = useState(false);

  function openOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(true);
  }

  function closeOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(false); */
  }

  function renderModals() {
    return (
      <>
        {/* <OutsideShareLinkModal
          isOpen={isOutsideShareLinkModalShown}
          onClose={closeOutsideShareLinkModalHandler}
        /> */}
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
        <i className="fa fa-share-alt"></i>
      </a>
      <div className="dropdown-menu dropdown-menu-right">
        <button className="dropdown-item" type="button" onClick={openOutsideShareLinkModalHandler}>
          <i className="icon-fw icon-magic-wand"></i> { t('template.option_label.create/edit') }
        </button>
      </div>
      {renderModals()}
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const PageShareManagementWrapper = (props) => {
  return createSubscribedElement(PageShareManagement, props, [AppContainer, PageContainer]);
};


PageShareManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageShareManagementWrapper);
