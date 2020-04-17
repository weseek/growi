import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { isTrashPage } from '../../../../lib/util/path-utils';
import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import RevisionPath from '../Page/RevisionPath';
import PageContainer from '../../services/PageContainer';
import TagLabels from '../Page/TagLabels';
import LikeButton from '../LikeButton';
import BookmarkButton from '../BookmarkButton';
import PageCreator from './PageCreator';
import RevisionAuthor from './RevisionAuthor';

const GrowiSubNavigation = (props) => {
  const isPageForbidden = document.querySelector('#grw-subnav').getAttribute('data-is-forbidden-page');
  const { appContainer, pageContainer } = props;
  const {
    pageId, path, createdAt, creator, updatedAt, revisionAuthor, isCompactMode,
  } = pageContainer.state;
  const compactClassName = isCompactMode ? 'grw-compact-subnavbar' : null;

  // Display only the RevisionPath if the page is trash or forbidden
  if (isTrashPage(path) || isPageForbidden) {
    return (
      <header className="d-flex align-items-center">
        <div className="title-container mr-auto">
          <h1>
            <RevisionPath behaviorType={appContainer.config.behaviorType} pageId={pageId} pagePath={pageContainer.state.path} />
          </h1>
        </div>
      </header>
    );
  }

  return (
    <header className={`d-flex px-3 py-1 align-items-center ${compactClassName}`}>

      {/* Page Path */}
      <div className="title-container mr-auto">
        <h1>
          <RevisionPath behaviorType={appContainer.config.behaviorType} pageId={pageId} pagePath={pageContainer.state.path} />
        </h1>
        <TagLabels />
      </div>

      {/* Header Button */}
      <div className="mr-2">
        <LikeButton pageId={pageId} isLiked={pageContainer.state.isLiked} />
      </div>
      <div>
        <BookmarkButton pageId={pageId} crowi={appContainer} />
      </div>

      {/* Page Authors */}
      <ul className="authors text-nowrap d-none d-lg-block">
        {creator != null && <li><PageCreator creator={creator} createdAt={createdAt} isCompactMode={isCompactMode} /></li>}
        { revisionAuthor != null
          && (
            <li className="mt-1">
              <RevisionAuthor revisionAuthor={revisionAuthor} updatedAt={updatedAt} isCompactMode={isCompactMode} />
            </li>
          )
        }
      </ul>

    </header>
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

  isCompactMode: PropTypes.bool,
};

export default withTranslation()(GrowiSubNavigationWrapper);
