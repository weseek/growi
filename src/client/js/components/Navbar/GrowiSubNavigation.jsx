import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { isTrashPage } from '@commons/util/path-utils';

import DevidedPagePath from '@commons/models/devided-page-path';
import LinkedPagePath from '@commons/models/linked-page-path';
import PagePathHierarchicalLink from '@commons/components/PagePathHierarchicalLink';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import NavigationContainer from '../../services/NavigationContainer';
import PageContainer from '../../services/PageContainer';

import RevisionPathControls from '../Page/RevisionPathControls';
import TagLabels from '../Page/TagLabels';
import LikeButton from '../LikeButton';
import BookmarkButton from '../BookmarkButton';
import ThreeStrandedButton from './ThreeStrandedButton';

import AuthorInfo from './AuthorInfo';
import DrawerToggler from './DrawerToggler';
import UserPicture from '../User/UserPicture';

import PageManagement from '../Page/PageManagement';


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
      <span className="d-flex align-items-center">
        <h1 className="m-0">{latterLink}</h1>
        <div className="mx-2">
          <RevisionPathControls
            pageId={pageId}
            pagePath={pagePath}
            isPageForbidden={isPageForbidden}
          />
        </div>
      </span>
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const UserPagePathNav = ({ pageId, pagePath }) => {
  const linkedPagePath = new LinkedPagePath(pagePath);
  const latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />;

  return (
    <div className="grw-page-path-nav">
      <span className="d-flex align-items-center flex-wrap">
        <h4 className="grw-user-page-path">{latterLink}</h4>
        <div className="mx-2">
          <RevisionPathControls
            pageId={pageId}
            pagePath={pagePath}
          />
        </div>
      </span>
    </div>
  );
};

/* eslint-disable react/prop-types */
const UserInfo = ({ pageUser }) => {
  return (
    <div className="grw-users-info d-flex align-items-center">
      <UserPicture user={pageUser} />

      <div className="users-meta">
        <h1 className="user-page-name">
          {pageUser.name}
        </h1>
        <div className="user-page-meta mt-1 mb-0">
          <span className="user-page-username mr-2"><i className="icon-user mr-1"></i>{pageUser.username}</span>
          <span className="user-page-email mr-2">
            <i className="icon-envelope mr-1"></i>
            {pageUser.isEmailPublished ? pageUser.email : '*****'}
          </span>
          {pageUser.introduction && <span className="user-page-introduction">{pageUser.introduction}</span>}
        </div>
      </div>

    </div>
  );
};
/* eslint-enable react/prop-types */

/* eslint-disable react/prop-types */
const PageReactionButtons = ({ appContainer, pageContainer }) => {

  const {
    pageId, isLiked, pageUser, sumOfLikers,
  } = pageContainer.state;

  return (
    <>
      {pageUser == null && (
      <span>
        <LikeButton pageId={pageId} isLiked={isLiked} />
      </span>
      )}
      <span className="mr-2 total-likes">
        {sumOfLikers}
      </span>
      <span className="mr-2">
        <BookmarkButton pageId={pageId} crowi={appContainer} />
      </span>
    </>
  );
};
/* eslint-enable react/prop-types */

const GrowiSubNavigation = (props) => {
  const {
    appContainer, navigationContainer, pageContainer, isCompactMode,
  } = props;
  const { isDrawerMode } = navigationContainer.state;
  const {
    pageId, path, createdAt, creator, updatedAt, revisionAuthor,
    isForbidden: isPageForbidden, pageUser, isCreatable,
  } = pageContainer.state;

  const { currentUser } = appContainer;
  const isPageNotFound = pageId == null;
  const isUserPage = pageUser != null;
  const isPageInTrash = isTrashPage(path);

  function onThreeStrandedButtonClicked(viewType) {
    navigationContainer.setEditorMode(viewType);
  }

  return (
    <div className={`grw-subnav d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>

      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        { isDrawerMode && (
          <div className="d-none d-md-flex align-items-center border-right mr-3 pr-3">
            <DrawerToggler />
          </div>
        ) }

        <div className="grw-path-nav-container">
          { !isCompactMode && !isPageNotFound && !isPageForbidden && !isUserPage && (
            <div className="mb-2">
              <TagLabels />
            </div>
          ) }

          { isUserPage
            ? (
              <>
                <UserPagePathNav pageId={pageId} pagePath={path} />
                <UserInfo pageUser={pageUser} />
              </>
            )
            : (
              <PagePathNav pageId={pageId} pagePath={path} isPageForbidden={isPageForbidden} />
            )
          }

        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">

        <div className="d-flex flex-column align-items-end justify-content-center">
          <div className="d-flex">
            { !isPageInTrash && !isPageNotFound && !isPageForbidden && <PageReactionButtons appContainer={appContainer} pageContainer={pageContainer} /> }
            { !isPageNotFound && !isPageForbidden && <PageManagement /> }
          </div>
          <div className="mt-2">
            { !isCreatable && <ThreeStrandedButton onThreeStrandedButtonClicked={onThreeStrandedButtonClicked} isBtnDisabled={currentUser == null} />}
          </div>
        </div>

        {/* Page Authors */}
        { (!isCompactMode && !isUserPage && !isPageNotFound && !isPageForbidden) && (
          <ul className="authors text-nowrap border-left d-none d-lg-block d-edit-none">
            <li className="pb-1">
              <AuthorInfo user={creator} date={createdAt} />
            </li>
            <li className="mt-1 pt-1 border-top">
              <AuthorInfo user={revisionAuthor} date={updatedAt} mode="update" />
            </li>
          </ul>
        ) }
      </div>

    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const GrowiSubNavigationWrapper = withUnstatedContainers(GrowiSubNavigation, [AppContainer, NavigationContainer, PageContainer]);


GrowiSubNavigation.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isCompactMode: PropTypes.bool,
};

export default withTranslation()(GrowiSubNavigationWrapper);
