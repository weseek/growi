import React, { FC } from 'react';

import { IPageSearchResultData } from '../../interfaces/search';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import SearchResultContentSubNavigation from './SearchResultContentSubNavigation';

// TODO : set focusedPage type to ?IPageSearchResultData once #80214 is merged
// PR: https://github.com/weseek/growi/pull/4649

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  focusedSearchResultData : IPageSearchResultData,
}


const SearchResultContent: FC<Props> = (props: Props) => {
  // Temporaly workaround for lint error
  // later needs to be fixed: RevisoinRender to typescriptcomponet
  const RevisionRenderTypeAny: any = RevisionLoader;
  const renderPage = (searchResultData) => {
    const page = searchResultData?.pageData || {};
    const growiRenderer = props.appContainer.getRenderer('searchresult');
    let showTags = false;
    if (page.tags != null && page.tags.length > 0) { showTags = true }
    return (
      <div key={page._id} className="search-result-page mb-5">
        <SearchResultContentSubNavigation pageId={page._id} path={page.path} />
        <RevisionRenderTypeAny
          growiRenderer={growiRenderer}
          pageId={page._id}
          pagePath={page.path}
          revisionId={page.revision}
          highlightKeywords={props.searchingKeyword}
        />
      </div>
    );
  };
  const content = renderPage(props.focusedSearchResultData);
  return (
    <div>{content}</div>
  );
};


export default SearchResultContent;
