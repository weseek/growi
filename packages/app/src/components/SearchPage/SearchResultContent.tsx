import React, { FC } from 'react';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';

import { IPageSearchResultData } from '../../interfaces/search';


type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  focusedPage: IPageSearchResultData,
}
const SearchResultContent: FC<Props> = (props: Props) => {
  // Temporaly workaround for lint error
  // later needs to be fixed: RevisoinRender to typescriptcomponet
  const RevisionRenderTypeAny: any = RevisionLoader;
  const renderPage = (page: IPageSearchResultData) => {
    const { pageData } = page;
    if (pageData == null) {
      return null;
    }

    const growiRenderer = props.appContainer.getRenderer('searchresult');
    let showTags = false;
    if (pageData.tags != null && pageData.tags.length > 0) { showTags = true }
    return (
      <div key={pageData._id} className="search-result-page mb-5">
        <h2>
          <a href={pageData.path} className="text-break">
            {pageData.path}
          </a>
          {showTags && (
            <div className="mt-1 small">
              <i className="tag-icon icon-tag"></i> {pageData.tags.join(', ')}
            </div>
          )}
        </h2>
        <RevisionRenderTypeAny
          growiRenderer={growiRenderer}
          pageId={pageData._id}
          pagePath={pageData.path}
          revisionId={pageData.revision}
          highlightKeywords={props.searchingKeyword}
        />
      </div>
    );
  };
  const content = renderPage(props.focusedPage);
  return (

    <div>{content}</div>
  );
};


export default SearchResultContent;
