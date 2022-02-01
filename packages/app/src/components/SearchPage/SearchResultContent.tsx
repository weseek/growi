import React, {
  FC, useRef, useState, useEffect,
} from 'react';
import { IPageSearchResultData } from '../../interfaces/search';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import SearchResultContentSubNavigation from './SearchResultContentSubNavigation';

const SCROLL_OFFSET_TOP = 150;

// TODO : set focusedPage type to ?IPageSearchResultData once #80214 is merged
// PR: https://github.com/weseek/growi/pull/4649

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  focusedSearchResultData : IPageSearchResultData,
}


const SearchResultContent: FC<Props> = (props: Props) => {
  const [isRevisionBodyRendered, setIsRevisionBodyRendered] = useState(false);
  const contentRef = useRef(null);
  useEffect(() => {
    // reset state
    setIsRevisionBodyRendered(false);
    if (isRevisionBodyRendered) {
      const searchResultPageContent = contentRef.current as HTMLElement| null;
      if (searchResultPageContent == null) return;
      const highlightedWord = searchResultPageContent?.querySelector('.highlighted-keyword') as HTMLElement | null;
      if (highlightedWord == null) return;
      smoothScrollIntoView(highlightedWord, SCROLL_OFFSET_TOP, searchResultPageContent);
    }
  }, [isRevisionBodyRendered]);

  const page = props.focusedSearchResultData?.pageData;
  // return if page is null
  if (page == null) return <></>;
  const growiRenderer = props.appContainer.getRenderer('searchresult');
  return (
    <div key={page._id} className="search-result-page grw-page-path-text-muted-container d-flex flex-column">
      <SearchResultContentSubNavigation
        pageId={page._id}
        revisionId={page.revision}
        path={page.path}
      >
      </SearchResultContentSubNavigation>
      <div className="search-result-page-content" ref={contentRef}>
        <RevisionLoader
          growiRenderer={growiRenderer}
          pageId={page._id}
          pagePath={page.path}
          revisionId={page.revision}
          highlightKeywords={props.searchingKeyword}
          onRevisionBodyRendered={setIsRevisionBodyRendered}
        />
      </div>
    </div>
  );
};


export default SearchResultContent;
