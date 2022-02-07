// This is the root component for #search-page

import React, {
  FC, useState, useCallback, useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
  DetachCodeBlockInterceptor,
  RestoreCodeBlockInterceptor,
} from '../client/util/interceptor/detach-code-blocks';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastError } from '~/client/util/apiNotification';
import SearchPageLayout from './SearchPage/SearchPageLayout';
import SearchResultContent from './SearchPage/SearchResultContent';
import SearchResultList from './SearchPage/SearchResultList';
import {
  CheckboxType, IPageSearchMeta, SearchResultMeta,
} from '~/interfaces/search';

import { useIsGuestUser } from '~/stores/context';
import { apiGet } from '~/client/util/apiv1-client';
import { IPageWithMeta } from '~/interfaces/page';


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

type Props = {
  appContainer: AppContainer,
  onAfterSearchInvoked?: (keyword: string, searchedKeyword: string) => Promise<void> | void,
  // eslint-disable-next-line max-len
  renderControl: ((searchResultCount, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox, searchingKeyword, onSearchInvoked) => React.FunctionComponent) | ((searchResultCount, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox) => React.FunctionComponent),
  setIsActionToPageModalShown: (x : boolean) => void,
  renderActionToPageModal: (getSelectedPagesForAction) => React.FunctionComponent,
  alertMessage?: React.ReactNode,
  query?: string,
  excludeTrashPages: boolean,
  excludeUserPages: boolean,
};

const SearchCore: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const query = getQueryByLocation(window.location);
  // TODO: Move this code to the right place after completing the "omit unstated" initiative.
  const { interceptorManager } = props.appContainer;
  if (interceptorManager != null) {
    interceptorManager.addInterceptor(new DetachCodeBlockInterceptor(props.appContainer), 10); // process as soon as possible
    interceptorManager.addInterceptor(new RestoreCodeBlockInterceptor(props.appContainer), 900); // process as late as possible
  }

  /*
   * SWR
   */
  const { data: isGuestUser } = useIsGuestUser();

  /*
   * State
   */
  const [searchingKeyword, setSearchingKeyword] = useState<string>(props.query != null ? props.query : decodeURI(query.q) || '');
  const [currentSearchedKeyword, setSearchedKeyword] = useState<string>('');
  // should be <[IPageSearchResultData] | []> but gives lint errors.
  const [searchResults, setSearchResults] = useState<any>([]);
  const [searchResultMeta, setSearchResultMeta] = useState<SearchResultMeta>({});
  const [focusedSearchResultData, setFocusedSearchResultData] = useState<IPageWithMeta<IPageSearchMeta> | null>(null);
  const [selectedPagesIdList, setSelectedPagesIdList] = useState<Set<string>>(new Set());
  const [searchResultCount, setSearchResultCount] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(1);
  const [pagingLimit, setPagingLimit] = useState<number>(props.appContainer.config.pageLimitationL || 50);
  const [selectAllCheckboxType, setSelectAllCheckboxType] = useState<CheckboxType>(CheckboxType.NONE_CHECKED);
  const [actionTargetPageIds, setActionToTargetPageIds] = useState<Set<string>>(new Set());


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

  const onAfterSearchHandler = useCallback((keyword) => {
    if (props.onAfterSearchInvoked == null) {
      return;
    }

    props.onAfterSearchInvoked(keyword, currentSearchedKeyword);
  }, [props.onAfterSearchInvoked, currentSearchedKeyword]);


  const createSearchQuery = useCallback((keyword, excludeTrashPages, excludeUserPages) => {
    let query = keyword;

    // pages included in specific path are not retrived when prefix is added
    if (excludeTrashPages) {
      query = `${query} -prefix:${specificPathNames.trash}`;
    }
    if (excludeUserPages) {
      query = `${query} -prefix:${specificPathNames.user}`;
    }

    return query;
  }, []);

  // refs: https://redmine.weseek.co.jp/issues/82139
  const search = useCallback(async(data) => {
    // reset following states when search runs
    setSelectedPagesIdList(new Set());
    setSelectAllCheckboxType(CheckboxType.NONE_CHECKED);

    const {
      keyword, excludeUserPages, excludeTrashPages, sort, order,
    } = data;

    if (keyword === '') {
      resetSearchState();
      return;
    }

    setSearchingKeyword(keyword);

    const offset = (activePage * pagingLimit) - pagingLimit;
    try {
      const res = await apiGet<any>('/search', {
        q: createSearchQuery(keyword, excludeTrashPages, excludeUserPages),
        limit: pagingLimit,
        offset,
        sort,
        order,
      });

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
  }, [currentSearchedKeyword, activePage, createSearchQuery, onAfterSearchHandler, pagingLimit]);

  const onPagingNumberChanged = useCallback(async(activePage) => {
    setActivePage(activePage);
    await search({ keyword: currentSearchedKeyword });
  }, [setActivePage, currentSearchedKeyword, search]);

  const onSearchInvoked = useCallback(async(data) => {
    setActivePage(1);
    await search(data);
  }, [setActivePage, search]);

  const onPagingLimitChanged = useCallback(async(limit) => {
    setPagingLimit(limit);
    await search({ keyword: currentSearchedKeyword });
  }, [search, currentSearchedKeyword, setPagingLimit]);

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

  const toggleAllCheckBox = () => {
    const next = selectAllCheckboxType === CheckboxType.ALL_CHECKED ? CheckboxType.NONE_CHECKED : CheckboxType.ALL_CHECKED;
    if (next === CheckboxType.NONE_CHECKED) {
      selectedPagesIdList.clear();
    }
    else {
      searchResults.forEach((page) => {
        selectedPagesIdList.add(page.pageData._id);
      });
    }
    setSelectedPagesIdList(selectedPagesIdList);
    setSelectAllCheckboxType(next);
  };

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
    setActionToTargetPageIds(new Set([pageId]));
    props.setIsActionToPageModalShown(true);
  }, [props.setIsActionToPageModalShown, setActionToTargetPageIds]);

  const actionToAllPagesButtonHandler = useCallback(() => {
    if (selectedPagesIdList.size === 0) { return }
    setActionToTargetPageIds(selectedPagesIdList);
    props.setIsActionToPageModalShown(true);
  }, [selectedPagesIdList, props.setIsActionToPageModalShown]);


  /*
   * componentDidMount
   */
  useEffect(() => {
    if (searchingKeyword !== '') {
      search({ keyword: searchingKeyword, excludeTrashPages: props.excludeTrashPages, excludeUserPages: props.excludeUserPages });
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
        activePage={activePage}
        pagingLimit={pagingLimit}
        onClickItem={selectPage}
        onClickCheckbox={toggleCheckBox}
        onPagingNumberChanged={onPagingNumberChanged}
        onClickDeleteButton={actionToSinglePageButtonHandler}
      />
    );
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
        // eslint-disable-next-line max-len
        Control={props.renderControl(searchResultCount, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox, searchingKeyword, onSearchInvoked)}
        SearchResultList={renderSearchResultList()}
        SearchResultContent={renderSearchResultContent()}
        searchResultMeta={searchResultMeta}
        searchingKeyword={currentSearchedKeyword}
        onPagingLimitChanged={onPagingLimitChanged}
        pagingLimit={pagingLimit}
        activePage={activePage}
        alertMessage={props.alertMessage}
      >
      </SearchPageLayout>
      {props.renderActionToPageModal != null && props.renderActionToPageModal(getSelectedPagesToAction)}
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
