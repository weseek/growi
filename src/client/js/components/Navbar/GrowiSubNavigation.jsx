import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { isTrashPage } from '@commons/util/path-utils';

import DevidedPagePath from '@commons/models/devided-page-path';
import LinkedPagePath from '@commons/models/linked-page-path';
import PagePathHierarchicalLink from '@commons/components/PagePathHierarchicalLink';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import RevisionPathControls from '../Page/RevisionPathControls';
import PageContainer from '../../services/PageContainer';
import TagLabels from '../Page/TagLabels';
import LikeButton from '../LikeButton';
import BookmarkButton from '../BookmarkButton';

import PageCreator from './PageCreator';
import RevisionAuthor from './RevisionAuthor';

// eslint-disable-next-line react/prop-types
const PagePathNav = ({ pageId, pagePath, isPageForbidden }) => {

  const dPagePath = new DevidedPagePath(pagePath, false, true);

  let formerLink;
  let latterLink;

  // when the path is root or first level
  if (dPagePath.isRoot || dPagePath.isFormerRoot) {
    const linkedPagePath = new LinkedPagePath(pagePath);
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />;
  }
  // when the path is second level or deeper
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />;
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} />;
  }

  return (
    <div className="grw-page-path-nav">
      {formerLink}
      <span className="d-flex align-items-center flex-wrap">
        <h1 className="m-0">{latterLink}</h1>
        <RevisionPathControls
          pageId={pageId}
          pagePath={pagePath}
          isPageForbidden={isPageForbidden}
        />
      </span>
    </div>
  );
};

const GrowiSubNavigation = (props) => {
  const { appContainer, pageContainer, isCompactMode } = props;
  const {
    pageId, path, createdAt, creator, updatedAt, revisionAuthor,
    isForbidden: isPageForbidden,
  } = pageContainer.state;

  const isPageNotFound = pageId == null;
  const isPageInTrash = isTrashPage(path);

  // Display only the RevisionPath
  if (isPageNotFound || isPageForbidden) {
    return (
      <div className="grw-subnav d-flex align-items-center justify-content-between">
        <PagePathNav pageId={pageId} pagePath={path} isPageForbidden={isPageForbidden} />
      </div>
    );
  }

  return (
    <div className={`grw-subnav d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact' : ''}`}>

      {/* Page Path */}
      <div>
        { !isCompactMode && !isPageNotFound && !isPageForbidden && (
          <div className="mb-2">
            <TagLabels />
          </div>
        ) }
        <PagePathNav pageId={pageId} pagePath={path} isPageForbidden={isPageForbidden} />
      </div>

      <div className="d-flex">

        {/* Buttons */}
        { !isPageInTrash && (
          <div className="d-flex flex-column align-items-end justify-content-center">
            <div className="d-flex">
              <span className="mr-2">
                <LikeButton pageId={pageId} isLiked={pageContainer.state.isLiked} />
              </span>
              <span className="mr-2">
                <BookmarkButton pageId={pageId} crowi={appContainer} />
              </span>
            </div>
            <div className="mt-2">
              {/* TODO: impl View / Edit / HackMD button group */}
              {/* <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className="btn btn-outline-primary">Left</button>
                <button type="button" className="btn btn-outline-primary">Middle</button>
                <button type="button" className="btn btn-outline-primary">Right</button>
              </div> */}
            </div>
          </div>
        ) }

        {/* Page Authors */}
        { !isCompactMode && (
          <ul className="authors text-nowrap border-left d-none d-lg-block d-edit-none">
            { creator != null && (
              <li className="pb-1">
                <PageCreator creator={creator} createdAt={createdAt} />
              </li>
            ) }
            { revisionAuthor != null && (
              <li className="mt-1 pt-1 border-top">
                <RevisionAuthor revisionAuthor={revisionAuthor} updatedAt={updatedAt} />
              </li>
            ) }
          </ul>
        ) }
      </div>

    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const GrowiSubNavigationWrapper = withUnstatedContainers(GrowiSubNavigation, [AppContainer, PageContainer]);


GrowiSubNavigation.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isCompactMode: PropTypes.bool,
};

export default withTranslation()(GrowiSubNavigationWrapper);
