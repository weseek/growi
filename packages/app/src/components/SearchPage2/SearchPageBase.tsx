import React, { FC, useState } from 'react';
import AppContainer from '~/client/services/AppContainer';
import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';
import { useIsGuestUser } from '~/stores/context';

import { SearchResultContent } from '../SearchPage/SearchResultContent';

type Props = {
  appContainer: AppContainer,

  SearchControl: React.FunctionComponent,
  SearchResultList: React.FunctionComponent,
  SearchResultListHead: React.FunctionComponent,
}

const SearchPageBase: FC<Props> = (props: Props) => {
  const {
    appContainer,
    SearchResultList, SearchControl, SearchResultListHead,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const [highlightKeywords, setHightlightKeywords] = useState('');
  const [selectedPageWithMeta, setSelectedPageWithMeta] = useState<IPageWithMeta<IPageSearchMeta> | null>(null);

  return (
    <div className="content-main">
      <div className="search-result d-flex" id="search-result">
        <div className="mw-0 flex-grow-1 flex-basis-0 border boder-gray search-result-list" id="search-result-list">

          <SearchControl></SearchControl>

          <div className="search-result-list-scroll">
            <div className="d-flex align-items-center justify-content-between my-3 ml-4">
              <SearchResultListHead />
            </div>
            <div className="page-list px-md-4">
              <SearchResultList></SearchResultList>
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
      </div>
    </div>
  );
};


export default SearchPageBase;
