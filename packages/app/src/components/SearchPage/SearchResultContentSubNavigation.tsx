import React, { FC } from 'react';
import PagePathNav from '../PagePathNav';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../client/services/AppContainer';
import SearchResultSubNavButton from './SearchResultSubNavButton';

type Props = {
  appContainer:AppContainer
  pageId: string,
  path: string,
  isSignleLineMode?: boolean,
  isCompactMode?: boolean,
}

const SearchResultContentSubNavigation: FC<Props> = (props : Props) => {
  const {
    appContainer, pageId, path, isCompactMode, isSignleLineMode,
  } = props;
  const SearchResultSubNavButtonTypeAny: any = SearchResultSubNavButton;
  const { isSharedUser } = appContainer;
  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>
      {/* Left side */}
      <div className="grw-path-nav-container">
        {/* TODO : refactor TagLabels in a way that it can be used independently from pageContainenr
              TASK: #80623 https://estoc.weseek.co.jp/redmine/issues/80623
              CONDITION reference : https://dev.growi.org/5fabddf8bbeb1a0048bcb9e9
              userPage is not included in search so chekcing only isSharedUser or not.
          */}
        {/* { !isSharedUser &&  !isCompactMode &&  (
          <div className="grw-taglabels-container">
            <TagLabels editorMode={editorMode} />
          </div>
        )} */}
        <PagePathNav pageId={pageId} pagePath={path} isCompactMode={isCompactMode} isSingleLineMode={isSignleLineMode} />
      </div>
      {/* Right side */}
      <div className="d-flex">
        <SearchResultSubNavButtonTypeAny pageId={pageId}></SearchResultSubNavButtonTypeAny>
      </div>
    </div>
  );
};


/**
 * Wrapper component for using unstated
 */
const SearchResultContentSubNavigationWrapper = withUnstatedContainers(SearchResultContentSubNavigation, [AppContainer]);


export default SearchResultContentSubNavigationWrapper;
