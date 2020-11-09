import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';


import DevidedPagePath from '~/models/devided-page-path';
import LinkedPagePath from '~/models/linked-page-path';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import { isCreatablePage, isTrashPage, isUserPage } from '~/utils/path-utils';
import { useCurrentPageSWR } from '~/stores/page';
import { useCurrentUser, useForbidden, useOwnerOfCurrentPage } from '~/stores/context';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import NavigationContainer from '../../services/NavigationContainer';

import TagLabels from '../Page/TagLabels';
// import LikeButton from '../LikeButton';
// import BookmarkButton from '../BookmarkButton';

import AuthorInfo from './AuthorInfo';
import DrawerToggler from './DrawerToggler';


// eslint-disable-next-line react/prop-types
const PagePathNav = ({ pageId, pagePath, isPageForbidden }) => {

  // dynamic import to skip rendering at SSR
  const RevisionPathControls = dynamic(() => import('../Page/RevisionPathControls'), { ssr: false });

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


/* eslint-enable react/prop-types */

/*
 * TODO: activate with GW-4210
 */
/* eslint-disable react/prop-types */
const PageReactionButtons = ({ appContainer, pageContainer }) => {

  // const {
  //   pageUser, shareLinkId,
  // } = pageContainer.state;

  // const isSharedPage = useMemo(() => {
  //   return shareLinkId != null;
  // }, [shareLinkId]);

  return (
    <>
      {/* {pageUser == null && !isSharedPage && (
      <span className="mr-2">
        <LikeButton />
      </span>
      )}
      <span>
        <BookmarkButton crowi={appContainer} />
      </span> */}
    </>
  );
};
/* eslint-enable react/prop-types */

const GrowiSubNavigation = (props) => {

  const { data: currentUser } = useCurrentUser();
  const { data: page } = useCurrentPageSWR();
  const { data: pageOwner } = useOwnerOfCurrentPage();
  const { data: isForbidden } = useForbidden();

  // dynamic import to skip rendering at SSR
  const PageManagement = dynamic(() => import('../Page/PageManagement'), { ssr: false });
  const ThreeStrandedButton = dynamic(() => import('./ThreeStrandedButton'), { ssr: false });

  const {
    navigationContainer, isCompactMode,
  } = props;
  const { isDrawerMode, editorMode } = navigationContainer.state;
  const {
    _id: pageId, path, creator, createdAt, updatedAt, revision,
  } = page;

  const isPageNotFound = page == null;
  const isPageInTrash = isTrashPage(path);
  const isPageUsersHome = isUserPage(path);
  const isCreatable = isCreatablePage(path);

  // Tags cannot be edited while the new page and editorMode is view
  const isTagLabelHidden = (editorMode !== 'edit' && isPageNotFound);
  // TODO: activate with GW-4402
  // const isSharedPage = shareLinkId != null;
  const isSharedPage = false;

  function onThreeStrandedButtonClicked(viewType) {
    navigationContainer.setEditorMode(viewType);
  }

  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>

      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        { isDrawerMode && (
          <div className="d-none d-md-flex align-items-center border-right mr-3 pr-3">
            {/* <DrawerToggler /> */}
          </div>
        ) }

        <div className="grw-path-nav-container">
          { !isCompactMode && !isTagLabelHidden && !isForbidden && !isPageUsersHome && !isSharedPage && (
            <div className="mb-2">
              <TagLabels editorMode={editorMode} />
            </div>
          ) }
          <PagePathNav pageId={pageId} pagePath={path} isPageForbidden={isForbidden} />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">

        <div className="d-flex flex-column align-items-end">
          <div className="d-flex">
            { !isPageInTrash && !isPageNotFound && !isForbidden && <PageReactionButtons /> }
            { !isPageNotFound && !isForbidden && <PageManagement isCompactMode={isCompactMode} /> }
          </div>
          <div className="mt-2">
            {isCreatable && !isPageInTrash && !isForbidden && (
              <ThreeStrandedButton
                onThreeStrandedButtonClicked={onThreeStrandedButtonClicked}
                isBtnDisabled={currentUser == null}
                editorMode={editorMode}
              />
            )}
          </div>
        </div>

        {/* Page Authors */}
        { (!isCompactMode && !isPageUsersHome && !isPageNotFound && !isForbidden) && (
          <ul className="authors text-nowrap border-left d-none d-lg-block d-edit-none py-2 pl-4 mb-0 ml-3">
            <li className="pb-1">
              <AuthorInfo user={creator} date={createdAt} locate="subnav" />
            </li>
            <li className="mt-1 pt-1 border-top">
              <AuthorInfo user={revision?.author} date={updatedAt} mode="update" locate="subnav" />
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
const GrowiSubNavigationWrapper = withUnstatedContainers(GrowiSubNavigation, [AppContainer, NavigationContainer]);


GrowiSubNavigation.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,

  isCompactMode: PropTypes.bool,
};

export default withTranslation()(GrowiSubNavigationWrapper);
