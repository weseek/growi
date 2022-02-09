import React, {
  FC, useRef, useCallback, useEffect,
} from 'react';

import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import { GrowiSubNavigation } from '../Navbar/GrowiSubNavigation';
import { SubNavButtons } from '../Navbar/SubNavButtons';

import { useIsRevisionBodyRendered } from '../../stores/context';

const SCROLL_OFFSET_TOP = 175; // approximate height of (navigation + subnavigation)

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  focusedSearchResultData : IPageWithMeta<IPageSearchMeta>,
}


const SearchResultContent: FC<Props> = (props: Props) => {
  const contentRef = useRef(null);

  useEffect(() => {
    document.addEventListener('isRevisionBodyRendered', (e) => {
      if (contentRef.current != null) {
        const scrollTargetElement = contentRef.current as HTMLElement;
        const highlightedKeyword = scrollTargetElement.querySelector('.highlighted-keyword') as HTMLElement;
        if (highlightedKeyword) {
          smoothScrollIntoView(highlightedKeyword, SCROLL_OFFSET_TOP, scrollTargetElement);
        }
      }
    });
  }, []);

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
        />
      </div>
    </div>
  );
};


export default SearchResultContent;
