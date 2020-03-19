import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import RevisionPath from '../Page/RevisionPath';
import PageContainer from '../../services/PageContainer';
import TagLabels from '../Page/TagLabels';

const GrowiSubNavigation = (props) => {
  const { appContainer, pageContainer } = props;
  const { isTrashPage } = pageContainer;


  return (
    <div className="d-flex align-items-center">

      <div className="title-container mr-auto">
        <h1>
          <RevisionPath behaviorType={appContainer.config.behaviorType} pageId={pageContainer.state.pageId} pagePath={pageContainer.state.path} />
        </h1>
        {/* TODO hide this component at forbidden page */}
        {!isTrashPage && <TagLabels />}
      </div>
    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const GrowiSubNavigationWrapper = (props) => {
  return createSubscribedElement(GrowiSubNavigation, props, [AppContainer, PageContainer]);
};


GrowiSubNavigation.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(GrowiSubNavigationWrapper);
