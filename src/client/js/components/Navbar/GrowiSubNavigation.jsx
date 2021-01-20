import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';


import DevidedPagePath from '~/models/devided-page-path';
import LinkedPagePath from '~/models/linked-page-path';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import { isCreatablePage, isTrashPage, isUserPage } from '~/utils/path-utils';
import { useCurrentPageSWR } from '~/stores/page';
import {
  useCurrentUser, useForbidden, useOwnerOfCurrentPage,
} from '~/stores/context';
import { useIsAbleToShowTagLabel, useIsAbleToShowPageAuthors, useIsAbleToShowPageEditorModeManager } from '~/stores/ui';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import NavigationContainer from '../../services/NavigationContainer';

// import LikeButton from '../LikeButton';
// import BookmarkButton from '../BookmarkButton';
// import TagLabels from '../Page/TagLabels';

import AuthorInfo from './AuthorInfo';
import DrawerToggler from './DrawerToggler';

const PagePathNav = ({
  // eslint-disable-next-line react/prop-types
  pageId, pagePath, isEditorMode, isCompactMode,
}) => {

  const CopyDropdown = dynamic(() => import('~/client/js/components/Page/CopyDropdown'), { ssr: false });

  const dPagePath = new DevidedPagePath(pagePath, false, true);

  let formerLink;
  let latterLink;

  // one line
  if (dPagePath.isRoot || dPagePath.isFormerRoot || isEditorMode) {
    const linkedPagePath = new LinkedPagePath(pagePath);
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />;
  }
  // two line
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />;
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} />;
  }

  const copyDropdownId = `copydropdown${isCompactMode ? '-subnav-compact' : ''}-${pageId}`;
  const copyDropdownToggleClassName = 'd-block text-muted bg-transparent btn-copy border-0 py-0';

  return (
    <div className="grw-page-path-nav">
      {formerLink}
      <span className="d-flex align-items-center">
        <h1 className="m-0">{latterLink}</h1>
        <div className="mx-2">
          <CopyDropdown
            pageId={pageId}
            pagePath={pagePath}
            dropdownToggleId={copyDropdownId}
            dropdownToggleClassName={copyDropdownToggleClassName}
          >
            <i className="ti-clipboard"></i>
          </CopyDropdown>
        </div>
      </span>
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const GrowiSubNavigationContainer = ({ isCompactMode, children }) => {
  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>
      {children}
    </div>
  );
};

const GrowiSubNavigation = (props) => {

  const { data: currentUser } = useCurrentUser();
  const { data: page } = useCurrentPageSWR();
  const { data: pageOwner } = useOwnerOfCurrentPage();
  const { data: isForbidden } = useForbidden();
  const { data: isAbleToShowTagLabel } = useIsAbleToShowTagLabel();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();
  const { data: isAbleToShowPageEditorModeManager } = useIsAbleToShowPageEditorModeManager();

  if (page == null) {
    return <GrowiSubNavigationContainer isCompactMode={props.isCompactMode}></GrowiSubNavigationContainer>;
  }

  // dynamic import to skip rendering at SSR
  const SubnavButtons = dynamic(() => import('~/components/Organisms/GrowiSubnavButtons'), { ssr: false });
  const PageEditorModeManager = dynamic(() => import('./PageEditorModeManager'), { ssr: false });
  const TagLabels = dynamic(() => import('~/client/js/components/Page/TagLabels'), { ssr: false });

  const {
    appContainer, navigationContainer, isCompactMode,
  } = props;
  const { isDrawerMode, editorMode, isDeviceSmallerThanMd } = navigationContainer.state;

  const {
    _id: pageId, path, creator, createdAt, updatedAt, revision,
  } = page;

  const isPageNotFound = page == null;
  const isPageInTrash = isTrashPage(path);
  const isPageUsersHome = isUserPage(path);
  const isCreatable = isCreatablePage(path);

  const { isGuestUser } = appContainer;
  const isEditorMode = editorMode !== 'view';
  // TODO: activate with GW-4402
  // const isSharedPage = shareLinkId != null;
  const isSharedPage = false;

  function onPageEditorModeButtonClicked(viewType) {
    navigationContainer.setEditorMode(viewType);
  }

  return (
    <GrowiSubNavigationContainer isCompactMode={props.isCompactMode}>

      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        { isDrawerMode && (
          <div className={`d-none d-md-flex align-items-center ${isEditorMode ? 'mr-2 pr-2' : 'border-right mr-4 pr-4'}`}>
            <DrawerToggler />
          </div>
        ) }

        <div className="grw-path-nav-container">
          { isAbleToShowTagLabel && !isCompactMode && (
            <div className="grw-taglabels-container">
              <TagLabels editorMode={editorMode} />
            </div>
          ) }
          <PagePathNav pageId={pageId} pagePath={path} isEditorMode={isEditorMode} isCompactMode={isCompactMode} />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">

        <div className="d-flex flex-column align-items-end">
          <div className="d-flex">
            {/* <SubnavButtons isCompactMode={isCompactMode} /> */}
          </div>
          <div className="mt-2">
            {isAbleToShowPageEditorModeManager && (
              <PageEditorModeManager
                onPageEditorModeButtonClicked={onPageEditorModeButtonClicked}
                isBtnDisabled={isGuestUser}
                editorMode={editorMode}
                isDeviceSmallerThanMd={isDeviceSmallerThanMd}
              />
            )}
          </div>
        </div>

        {/* Page Authors */}
        { (isAbleToShowPageAuthors && !isCompactMode) && (
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

    </GrowiSubNavigationContainer>
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
