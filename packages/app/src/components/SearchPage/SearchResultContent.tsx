import React, { FC, useCallback } from 'react';

import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import { GrowiSubNavigation } from '../Navbar/GrowiSubNavigation';
import SubNavButtons from '../Navbar/SubNavButtons';

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  focusedSearchResultData : IPageWithMeta<IPageSearchMeta>,
}


const SearchResultContent: FC<Props> = (props: Props) => {
  const page = props.focusedSearchResultData?.pageData;

  const growiRenderer = props.appContainer.getRenderer('searchresult');

  const ControlComponents = useCallback(() => {
    if (page == null) {
      return <></>;
    }

    return (
      <>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
          <SubNavButtons
            pageId={page._id}
            revisionId={page.revision as string}
            path={page.path}
          />
        </div>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
        </div>
      </>
    );
  }, [page]);

  // return if page is null
  if (page == null) return <></>;

  return (
    <div key={page._id} className="search-result-page grw-page-path-text-muted-container d-flex flex-column">
      <GrowiSubNavigation
        page={page}
        controls={ControlComponents}
      />
      <div className="search-result-page-content">
        <RevisionLoader
          growiRenderer={growiRenderer}
          pageId={page._id}
          pagePath={page.path}
          revisionId={page.revision}
          highlightKeywords={props.searchingKeyword}
        />
      </div>
    </div>
  );
};


export default SearchResultContent;
