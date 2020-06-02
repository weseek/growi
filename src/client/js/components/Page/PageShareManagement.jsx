import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import OutsideShareLinkModal from '../OutsideShareLinkModal';


const PageShareManagement = (props) => {
  /* const { t } = props; */


  const [isOutsideShareLinkModalShown, setIsOutsideShareLinkModalShown] = useState(false);

  function openOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(true);
  }

  function closeOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(false);
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

  return (
    <>
      <a className="nav-link" href="#" role="tab" data-toggle="tab" onClick={openOutsideShareLinkModalHandler}>
        <i className="fa fa-share-alt"></i>
      </a>
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
