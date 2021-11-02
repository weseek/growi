import React, { FC } from 'react';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import GrowiSubNavigation from '../Navbar/GrowiSubNavigation';

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  selectedPage : null | any,
}
const SearchResultContent: FC<Props> = (props: Props) => {
  const page = props.selectedPage;
  if (page == null) return null;
  // Temporaly workaround for lint error
  // later needs to be fixed: RevisoinRender to typescriptcomponet
  const RevisionLoaderTypeAny: any = RevisionLoader;
  const GrowiSubNavigationTypeAny: any = GrowiSubNavigation;
  const growiRenderer = props.appContainer.getRenderer('searchresult');
  let showTags = false;
  if (page.tags != null && page.tags.length > 0) { showTags = true }
  return (
    <div key={page._id} className="search-result-page mb-5">
      <GrowiSubNavigationTypeAny isSearchPageMode pageId={page._id} path={page.path}></GrowiSubNavigationTypeAny>
      <RevisionLoaderTypeAny
        growiRenderer={growiRenderer}
        pageId={page._id}
        pagePath={page.path}
        revisionId={page.revision}
        highlightKeywords={props.searchingKeyword}
      />
    </div>
  );
};


export default SearchResultContent;
