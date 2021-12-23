import React, { FC } from 'react';
import { pagePathUtils } from '@growi/core';
import PagePathNav from '../PagePathNav';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../client/services/AppContainer';
import { useSWRTagsInfo } from '../../stores/page';
import SubNavButtons from '../Navbar/SubNavButtons';

type Props = {
  appContainer:AppContainer
  pageId: string,
  revisionId: string,
  path: string,
  isSignleLineMode?: boolean,
  isCompactMode?: boolean,
}


const SearchResultContentSubNavigation: FC<Props> = (props : Props) => {
  const {
    appContainer, pageId, revisionId, path, isCompactMode, isSignleLineMode,
  } = props;

  const { isTrashPage, isDeletablePage } = pagePathUtils;

  const { data: tagInfoData, error: tagInfoError } = useSWRTagsInfo(pageId);

  if (tagInfoError != null || tagInfoData == null) {
    return <></>;
  }
  const isPageDeletable = isDeletablePage(path);
  const { isSharedUser } = appContainer;
  const isAbleToShowPageManagement = !(isTrashPage(path)) && !isSharedUser;
  return (
    <div className="shadow-sm search-result-content-nav">
      <div className={`grw-subnav container-fluid d-flex align-items-start justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>
        {/* Left side */}
        <div className="grw-path-nav-container">
          <PagePathNav pageId={pageId} pagePath={path} isCompactMode={isCompactMode} isSingleLineMode={isSignleLineMode} />
        </div>
        {/* Right side */}
        {/*
          DeleteCompletely is currently disabled
          TODO : Retrive isAbleToDeleteCompleltly state everywhere in the system via swr.
          story: https://redmine.weseek.co.jp/issues/82222
        */}
        <div className="d-flex">
          <SubNavButtons
            isCompactMode={isCompactMode}
            pageId={pageId}
            revisionId={revisionId}
            path={path}
            isDeletable={isPageDeletable}
            // isAbleToDeleteCompletely={}
            willShowPageManagement={isAbleToShowPageManagement}
          >
          </SubNavButtons>
        </div>
      </div>
    </div>
  );
};


/**
 * Wrapper component for using unstated
 */
const SearchResultContentSubNavigationUnstatedWrapper = withUnstatedContainers(SearchResultContentSubNavigation, [AppContainer]);

// wrapping tsx component returned by withUnstatedContainers to avoid type error when this component used in other tsx components.
const SearchResultContentSubNavigationWrapper = (props) => {
  return <SearchResultContentSubNavigationUnstatedWrapper {...props}></SearchResultContentSubNavigationUnstatedWrapper>;
};
export default SearchResultContentSubNavigationWrapper;
