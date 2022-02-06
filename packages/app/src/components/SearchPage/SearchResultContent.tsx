import React, {
  FC, useRef, useState, useEffect, useCallback,
} from 'react';

import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import { GrowiSubNavigation } from '../Navbar/GrowiSubNavigation';
import { SubNavButtons } from '../Navbar/SubNavButtons';

const SCROLL_OFFSET_TOP = 175; // approximate height of (navigation + subnavigation)

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  focusedSearchResultData : IPageWithMeta<IPageSearchMeta>,
}


const SearchResultContent: FC<Props> = (props: Props) => {
  const [isRevisionBodyRendered, setIsRevisionBodyRendered] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    // reset state
    if (isRevisionBodyRendered) {
      const searchResultPageContent = contentRef.current as HTMLElement | null;
      if (searchResultPageContent != null) {
        const highlightedWord = searchResultPageContent?.querySelector('.highlighted-keyword') as HTMLElement | null;
        if (highlightedWord != null) {
          smoothScrollIntoView(highlightedWord, SCROLL_OFFSET_TOP, searchResultPageContent);
        }
      }
      setIsRevisionBodyRendered(false);
    }
  }, [isRevisionBodyRendered]);

  const page = props.focusedSearchResultData?.pageData;

  const growiRenderer = props.appContainer.getRenderer('searchresult');

  const ControlComponents = useCallback(() => {
    if (page == null) {
      return <></>;
    }

    return (
      <>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
          <SubNavButtons pageId={page._id} />
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
