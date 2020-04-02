import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import RevisionPath from '../Page/RevisionPath';
import PageContainer from '../../services/PageContainer';
import TagLabels from '../Page/TagLabels';
import LikeButton from '../LikeButton';
import BookmarkButton from '../BookmarkButton';
import ReducedPageCreator from './ReducedPageCreator';
import ReducedRevisionAuthor from './ReducedRevisionAuthor';

const GrowiCompactSubNavigation = (props) => {
  const { appContainer, pageContainer } = props;
  const {
    createdAt, creator, updatedAt, revisionAuthor,
  } = pageContainer.state;
  return (
    <div className="d-flex align-items-center fixed-top grw-compact-subnavbar px-3">

      {/* Page Path */}
      <div className="title-container mr-auto">
        <h2>
          <RevisionPath behaviorType={appContainer.config.behaviorType} pageId={pageContainer.state.pageId} pagePath={pageContainer.state.path} />
        </h2>
        <TagLabels />
      </div>

      {/* Header Button */}
      <div className="ml-1">
        <LikeButton pageId={pageContainer.state.pageId} isLiked={pageContainer.state.isLiked} />
      </div>
      <div>
        <BookmarkButton pageId={pageContainer.state.pageId} crowi={appContainer} />
      </div>

      {/* Page Authors */}
      <ul className="authors text-nowrap d-none d-lg-block">
        {creator != null && <li><ReducedPageCreator creator={creator} createdAt={createdAt} /></li>}
        {revisionAuthor != null && <li className="mt-1"><ReducedRevisionAuthor revisionAuthor={revisionAuthor} updatedAt={updatedAt} /></li>}
      </ul>

    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const GrowiCompactSubNavigationWrapper = (props) => {
  return createSubscribedElement(GrowiCompactSubNavigation, props, [AppContainer, PageContainer]);
};


GrowiCompactSubNavigation.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(GrowiCompactSubNavigationWrapper);
