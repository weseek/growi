import React, { FC, useState } from 'react';
import AppContainer from '~/client/services/AppContainer';
import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';
import { useIsGuestUser } from '~/stores/context';

import { SearchResultContent } from '../SearchPage/SearchResultContent';
import SearchResultList from '../SearchPage/SearchResultList';

type Props = {
  appContainer: AppContainer,

  pages?: IPageWithMeta<IPageSearchMeta>[],

  SearchControl: React.FunctionComponent,
  SearchResultListHead: React.FunctionComponent,
}

const SearchPageBase: FC<Props> = (props: Props) => {
  const {
    appContainer,
    pages,
    SearchControl, SearchResultListHead,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  // TODO get search keywords and split
  // ref: RevisionRenderer
  //   [...keywords.match(/"[^"]+"|[^\u{20}\u{3000}]+/ug)].forEach((keyword, i) => {
  const [highlightKeywords, setHightlightKeywords] = useState<string[]>([]);
  const [selectedPageWithMeta, setSelectedPageWithMeta] = useState<IPageWithMeta<IPageSearchMeta> | undefined>();

  const isLoading = pages == null;

  return (
    <div className="content-main">
      <div className="search-result d-flex" id="search-result">

        { isLoading && (
          <div className="mw-0 flex-grow-1 flex-basis-0 m-5 text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        ) }

        { !isLoading && (
          <>
            <div className="mw-0 flex-grow-1 flex-basis-0 border boder-gray search-result-list" id="search-result-list">

              <SearchControl></SearchControl>

              <div className="search-result-list-scroll">
                <div className="d-flex align-items-center justify-content-between my-3 ml-4">
                  <SearchResultListHead />
                </div>
                <div className="page-list px-md-4">
                  <SearchResultList
                    pages={pages}
                    onPageSelected={page => setSelectedPageWithMeta(page)}
                  />
                </div>
              </div>

            </div>

            <div className="mw-0 flex-grow-1 flex-basis-0 d-none d-lg-block search-result-content">
              { selectedPageWithMeta != null && (
                <SearchResultContent
                  appContainer={appContainer}
                  pageWithMeta={selectedPageWithMeta}
                  highlightKeywords={highlightKeywords}
                  showPageControlDropdown={isGuestUser}
                />
              )}
            </div>
          </>
        ) }

      </div>
    </div>
  );
};


export default SearchPageBase;
