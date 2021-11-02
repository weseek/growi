import React, { FC } from 'react';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import GrowiSubNavigation from '../Navbar/GrowiSubNavigation';

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  selectedPage : any,
}
const SearchResultContent: FC<Props> = (props: Props) => {
  // Temporaly workaround for lint error
  // later needs to be fixed: RevisoinRender to typescriptcomponet
  const RevisionRenderTypeAny: any = RevisionLoader;
  const GrowiSubNavigationTypeAny: any = GrowiSubNavigation;
  const renderPage = (page) => {
    const growiRenderer = props.appContainer.getRenderer('searchresult');
    let showTags = false;
    if (page.tags != null && page.tags.length > 0) { showTags = true }
    return (
      <div key={page._id} className="search-result-page mb-5">
        <GrowiSubNavigationTypeAny isSearchPageMode pageId={page._id} path={page.path}></GrowiSubNavigationTypeAny>
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
  const content = renderPage(props.selectedPage);
  return (

    <div>{content}</div>
  );
};


export default SearchResultContent;
