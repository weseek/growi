// This is the root component for #search-page

import React, {
  FC, useState, useCallback, useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastError } from '~/client/util/apiNotification';
import SearchPageLayout from './SearchPage/SearchPageLayout';
import SearchResultContent from './SearchPage/SearchResultContent';
import SearchResultList from './SearchPage/SearchResultList';
import SearchControl from './SearchPage/SearchControl';
import {
  CheckboxType, IPageSearchResultData, SearchResultMeta, SORT_AXIS, SORT_ORDER,
} from '~/interfaces/search';
import { useIsGuestUser } from '~/stores/context';
import { apiGet } from '~/client/util/apiv1-client';
import { apiv3Get } from '~/client/util/apiv3-client';


export const specificPathNames = {
  user: '/user',
  trash: '/trash',
};

/*
 * Utilities
 */
const getQueryByLocation = (location: Location) => {
  const search = location.search || '';
  const query : any = {};

  search.replace(/^\?/, '').split('&').forEach((element) => {
    const queryParts = element.split('=');
    query[queryParts[0]] = decodeURIComponent(queryParts[1]).replace(/\+/g, ' ');
  });

  return query;
};


// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. implement PageDeleteModal
// 2. disable search form when this component is used in LegacyPage
// 3. onAfterSearchInvoked should be refactored in LegacyPage
// 4. text in ActionToPageGroup
type Props = {
  appContainer: AppContainer,
  onAfterSearchInvoked: (keyword: string, searchedKeyword: string) => Promise<void> | void,
  renderActionToPagesModal: (isDeleteConfirmModalShown, getSelectedPagesToDelete, closeDeleteConfirmModalHandler) => React.FunctionComponent,
  // eslint-disable-next-line max-len
  renderSearchControl:any, // (searchingKeyword, sort, order, searchResultCount, appContainer, onSearchInvoked, toggleAllCheckBox, selectAllCheckboxType, actionToAllPagesButtonHandler, switchExcludeUserPagesHandler, switchExcludeTrashPagesHandler, excludeUserPages, excludeTrashPages, onChangeSortInvoked) => React.FunctionComponent,

};

const SearchCore: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const query = getQueryByLocation(window.location);

  /*
   * SWR
   */
  const { data: isGuestUser } = useIsGuestUser();

  /*
   * State
   */
  const [searchingKeyword, setSearchingKeyword] = useState<string>(decodeURI(query.q) || '');
  const [currentSearchedKeyword, setSearchedKeyword] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any>([]);
  const [searchResultMeta, setSearchResultMeta] = useState<SearchResultMeta>({});
  const [focusedSearchResultData, setFocusedSearchResultData] = useState<IPageSearchResultData | null>(null);
  const [selectedPagesIdList, setSelectedPagesIdList] = useState<Set<string>>(new Set());
  const [searchResultCount, setSearchResultCount] = useState<number>(0);
  const [shortBodiesMap, setShortBodiesMap] = useState<Record<string, string> | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [pagingLimit, setPagingLimit] = useState<number>(props.appContainer.config.pageLimitationL || 50);
  const [excludeUserPages, setExcludeUserPages] = useState<boolean>(true);
  const [excludeTrashPages, setExcludeTrashPages] = useState<boolean>(true);
  const [sort, setSort] = useState<SORT_AXIS>(SORT_AXIS.RELATION_SCORE);
  const [order, setOrder] = useState<SORT_ORDER>(SORT_ORDER.DESC);
  const [selectAllCheckboxType, setSelectAllCheckboxType] = useState<CheckboxType>(CheckboxType.NONE_CHECKED);
  const [isActionToPageModalShown, setIsActionToPageModalShown] = useState<boolean>(false);
  const [actionTargetPageIds, sestActionToTargetPageIds] = useState<Set<unknown>>(new Set());


  /*
   * Function
   */
  const resetSearchState = (keyword?: string) => {
    setSearchingKeyword(keyword || '');
    setSearchedKeyword('');
    setSearchResults([]);
    setSearchResultMeta({});
    setSearchResultCount(0);
    setActivePage(1);
  };

  const switchExcludeUserPagesHandler = useCallback(() => {
    setExcludeUserPages(prev => !prev);
  }, [excludeUserPages]);

  const switchExcludeTrashPagesHandler = useCallback(() => {
    setExcludeTrashPages(prevState => !prevState);

  }, [excludeTrashPages]);

  const onChangeSortInvoked = useCallback((nextSort, nextOrder) => {
    setSort(nextSort);
    setOrder(nextOrder);
  }, []);

  const onAfterSearchHandler = useCallback((keyword) => {
    if (props.onAfterSearchInvoked == null) {
      return;
    }

    props.onAfterSearchInvoked(keyword, currentSearchedKeyword);
  }, [props.onAfterSearchInvoked, currentSearchedKeyword]);

  const fetchShortBodiesMap = useCallback(async(pageIds) => {
    const res = await apiv3Get('/page-listing/short-bodies', { pageIds });
    setShortBodiesMap(res.data.shortBodiesMap);
  }, []);

  const createSearchQuery = useCallback((keyword) => {
    let query = keyword;

    // pages included in specific path are not retrived when prefix is added
    if (excludeTrashPages) {
      query = `${query} -prefix:${specificPathNames.trash}`;
    }
    if (excludeUserPages) {
      query = `${query} -prefix:${specificPathNames.user}`;
    }

    return query;
  }, [excludeTrashPages, excludeUserPages]);

  // refs: https://redmine.weseek.co.jp/issues/82139
  const search = useCallback(async(data) => {
    // reset following states when search runs
    setSelectedPagesIdList(new Set());
    setSelectAllCheckboxType(CheckboxType.NONE_CHECKED);

    const keyword = data.keyword;
    if (keyword === '') {
      resetSearchState();
      return;
    }

    setSearchingKeyword(keyword);

    const offset = (activePage * pagingLimit) - pagingLimit;
    try {
      const res = await apiGet<any>('/search', {
        q: createSearchQuery(keyword),
        limit: pagingLimit,
        offset,
        sort,
        order,
      });

      /*
       * non-await asynchronous short body fetch
       */
      const pageIds = res.data.map((page) => {
        if (page.pageMeta?.elasticSearchResult != null && page.pageMeta?.elasticSearchResult?.snippet.length !== 0) {
          return null;
        }

        return page.pageData._id;
      }).filter(id => id != null);
      fetchShortBodiesMap(pageIds);

      onAfterSearchHandler(keyword);

      if (res.data.length > 0) {
        setSearchedKeyword(keyword);
        setSearchResults(res.data);
        setSearchResultMeta(res.meta);
        setSearchResultCount(res.meta.total);
        setFocusedSearchResultData(res.data[0]);
        setActivePage(currentSearchedKeyword === keyword ? activePage : 1);
      }
      else {
        resetSearchState(keyword);
      }
    }
    catch (err) {
      toastError(err);
    }
  }, [currentSearchedKeyword, activePage, createSearchQuery, fetchShortBodiesMap, onAfterSearchHandler, order, pagingLimit, sort]);

  const onPagingNumberChanged = useCallback(async(activePage) => {
    setActivePage(activePage);
    await search({ keyword: currentSearchedKeyword });
  }, [currentSearchedKeyword, search]);

  const onSearchInvoked = useCallback(async(data) => {
    setActivePage(1);
    await search(data);
  }, [search]);

  const onPagingLimitChanged = useCallback(async(limit) => {
    setPagingLimit(limit);
    await search({ keyword: currentSearchedKeyword });
  }, [currentSearchedKeyword, search]);

  const selectPage = useCallback((pageId) => {
    const index = searchResults.findIndex(({ pageData }) => {
      return pageData._id === pageId;
    });
    setFocusedSearchResultData(searchResults[index]);
  }, [searchResults]);

  const toggleCheckBox = useCallback((pageId) => {
    if (selectedPagesIdList.has(pageId)) {
      selectedPagesIdList.delete(pageId);
    }
    else {
      selectedPagesIdList.add(pageId);
    }
    switch (selectedPagesIdList.size) {
      case 0:
        return setSelectAllCheckboxType(CheckboxType.NONE_CHECKED);
      case searchResults.length:
        return setSelectAllCheckboxType(CheckboxType.ALL_CHECKED);
      default:
        return setSelectAllCheckboxType(CheckboxType.INDETERMINATE);
    }
  }, [selectedPagesIdList, searchResults]);

  const toggleAllCheckBox = useCallback((nextSelectAllCheckboxType) => {
    if (nextSelectAllCheckboxType === CheckboxType.NONE_CHECKED) {
      selectedPagesIdList.clear();
    }
    else {
      searchResults.forEach((page) => {
        selectedPagesIdList.add(page.pageData._id);
      });
    }
    setSelectedPagesIdList(selectedPagesIdList);
    setSelectAllCheckboxType(nextSelectAllCheckboxType);
  }, [searchResults, selectedPagesIdList]);


  const getSelectedPagesToAction = useCallback(() => {
    const filteredPages = searchResults.filter((page) => {
      return Array.from(actionTargetPageIds).find(id => id === page.pageData._id);
    });
    return filteredPages.map(page => ({
      pageId: page.pageData._id,
      revisionId: page.pageData.revision,
      path: page.pageData.path,
    }));
  }, [actionTargetPageIds, searchResults]);


  const actionToSinglePageButtonHandler = useCallback((pageId) => {
    sestActionToTargetPageIds(new Set([pageId]));
    setIsActionToPageModalShown(true);
  }, []);

  const actionToAllPagesButtonHandler = useCallback(() => {
    if (selectedPagesIdList.size === 0) { return }
    sestActionToTargetPageIds(selectedPagesIdList);
    setIsActionToPageModalShown(true);
  }, [selectedPagesIdList]);


  const closeActionConfirmModalHandler = useCallback(() => {
    setIsActionToPageModalShown(false);
  }, []);

  /*
   * componentDidMount
   */
  useEffect(() => {
    if (searchingKeyword !== '') {
      search({ keyword: searchingKeyword });
    }
  }, []);

  const renderSearchResultContent = () => {
    return (
      <SearchResultContent
        appContainer={props.appContainer}
        searchingKeyword={searchingKeyword}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        focusedSearchResultData={focusedSearchResultData!}
      >
      </SearchResultContent>
    );
  };

  const renderSearchResultList = () => {
    return (
      <SearchResultList
        pages={searchResults || []}
        isEnableActions={!isGuestUser}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        focusedSearchResultData={focusedSearchResultData!}
        selectedPagesIdList={selectedPagesIdList || []}
        searchResultCount={searchResultCount}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        shortBodiesMap={shortBodiesMap!}
        activePage={activePage}
        pagingLimit={pagingLimit}
        onClickSearchResultItem={selectPage}
        onClickCheckbox={toggleCheckBox}
        onPagingNumberChanged={onPagingNumberChanged}
        onClickDeleteButton={actionToSinglePageButtonHandler}
      />
    );
  };

  const renderSearchControl = () => {
    if (props.renderSearchControl == null) {
      return <></>;
    }
    // eslint-disable-next-line max-len
    return props.renderSearchControl(searchingKeyword, sort, order, searchResultCount, props.appContainer, onSearchInvoked, toggleAllCheckBox, selectAllCheckboxType, actionToAllPagesButtonHandler, switchExcludeUserPagesHandler, switchExcludeTrashPagesHandler, excludeUserPages, excludeTrashPages, onChangeSortInvoked);
  };
  /*
   * Dependencies
   */
  if (isGuestUser == null) {
    return <></>;
  }

  return (
    <div>
      <SearchPageLayout
        SearchControl={renderSearchControl}
        SearchResultList={renderSearchResultList}
        SearchResultContent={renderSearchResultContent}
        searchResultMeta={searchResultMeta}
        searchingKeyword={currentSearchedKeyword}
        onPagingLimitChanged={onPagingLimitChanged}
        pagingLimit={pagingLimit}
        activePage={activePage}
      >
      </SearchPageLayout>
      {props.renderActionToPagesModal(isActionToPageModalShown, getSelectedPagesToAction, closeActionConfirmModalHandler)}
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const SearchCoreUnstatedWrapper = withUnstatedContainers(SearchCore, [AppContainer]);

const SearchCoreWrapper = (props) => {
  return <SearchCoreUnstatedWrapper {...props}></SearchCoreUnstatedWrapper>;
};
export default SearchCoreWrapper;
