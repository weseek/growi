import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { isTrashPage } from '@commons/util/path-utils';

import DevidedPagePath from '@commons/models/devided-page-path';
import LinkedPagePath from '@commons/models/linked-page-path';
import PagePathHierarchicalLink from '@commons/components/PagePathHierarchicalLink';

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
  const isPageForbidden = document.querySelector('#grw-subnav').getAttribute('data-is-forbidden-page') === 'true';
  const { appContainer, pageContainer } = props;
  const {
    pageId, path, createdAt, creator, updatedAt, revisionAuthor, isHeaderSticky, isSubnavCompact,
  } = pageContainer.state;

  const isPageNotFound = pageId == null;
  const isPageInTrash = isTrashPage(path);

  const dPagePath = new DevidedPagePath(pageContainer.state.path, false, true);
  const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
  const renderFormerLink = () => (
    <>
      { !dPagePath.isRoot && <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} /> }
    </>
  );

  // Display only the RevisionPath
  if (isPageNotFound || isPageForbidden) {
    return (
      <div className="px-3 py-3 grw-subnavbar">
        { renderFormerLink() }
        <h1 className="m-0">
          <RevisionPath
            pageId={pageId}
            pagePath={pageContainer.state.path}
            isPageForbidden={isPageForbidden}
            isPageInTrash={isPageInTrash}
          />
        </h1>
      </div>
    );
  }

  const additionalClassNames = ['grw-subnavbar'];
  const layoutType = appContainer.getConfig().layoutType;

  if (layoutType === 'growi') {
    if (isHeaderSticky) {
      additionalClassNames.push('grw-subnavbar-sticky');
    }
    if (isSubnavCompact) {
      additionalClassNames.push('grw-subnavbar-compact');
    }
  }

  return (
    <div className={`d-flex align-items-center justify-content-between px-3 py-1 ${additionalClassNames.join(' ')}`}>

      {/* Page Path */}
      <div>
        { renderFormerLink() }
        <h1 className="m-0">
          <RevisionPath pageId={pageId} pagePath={pageContainer.state.path} />
        </h1>
        { !isPageNotFound && !isPageForbidden && (
          <TagLabels />
        ) }
      </div>

      <div className="d-flex align-items-center">
        { !isPageInTrash && (
          /* Header Button */
          <div className="mr-2">
            <LikeButton pageId={pageId} isLiked={pageContainer.state.isLiked} />
          </div>
        ) }
        { !isPageInTrash && (
        ) }

        {/* Page Authors */}
        <ul className="authors text-nowrap d-none d-lg-block d-edit-none">
          { creator != null && (
            <li>
              <PageCreator creator={creator} createdAt={createdAt} isCompactMode={isSubnavCompact} />
            </li>
          ) }
          { revisionAuthor != null && (
            <li className="mt-1">
              <RevisionAuthor revisionAuthor={revisionAuthor} updatedAt={updatedAt} isCompactMode={isSubnavCompact} />
            </li>
          ) }
        </ul>
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
