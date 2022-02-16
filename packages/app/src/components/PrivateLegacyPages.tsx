import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
  UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import AppContainer from '~/client/services/AppContainer';
import { IFormattedSearchResult } from '~/interfaces/search';
import { ISelectableAll, ISelectableAndIndeterminatable } from '~/client/interfaces/selectable-all';
import {
  ISearchConfigurations, useSWRxNamedQuerySearch,
} from '~/stores/search';

import PaginationWrapper from './PaginationWrapper';
import { OperateAllControl } from './SearchPage/OperateAllControl';

import { SearchPageBase } from './SearchPage2/SearchPageBase';


// TODO: replace with "customize:showPageLimitationS"
const INITIAL_PAGIONG_SIZE = 20;


/**
 * SearchResultListHead
 */

type SearchResultListHeadProps = {
  searchResult: IFormattedSearchResult,
  offset: number,
  pagingSize: number,
  onPagingSizeChanged: (size: number) => void,
}

const SearchResultListHead = React.memo((props: SearchResultListHeadProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    searchResult, offset, pagingSize,
    onPagingSizeChanged,
  } = props;

  const { took, total, hitsCount } = searchResult.meta;
  const leftNum = offset + 1;
  const rightNum = offset + hitsCount;

  if (total === 0) {
    return (
      <div className="card border-success mt-3">
        <div className="card-body">
          <h2 className="card-title text-success">{t('private_legacy_pages.nopages_title')}</h2>
          <p className="card-text">
            {t('private_legacy_pages.nopages_desc1')}<br />
            {/* eslint-disable-next-line react/no-danger */}
            <span dangerouslySetInnerHTML={{ __html: t('private_legacy_pages.detail_info') }}></span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="form-inline d-flex align-items-center justify-content-between">
        <div className="text-nowrap">
          {t('search_result.result_meta')}
          <span className="ml-3">{`${leftNum}-${rightNum}`} / {total}</span>
          { took != null && (
            <span className="ml-3 text-muted">({took}ms)</span>
          ) }
        </div>
        <div className="input-group flex-nowrap search-result-select-group ml-auto d-md-flex d-none">
          <div className="input-group-prepend">
            <label className="input-group-text text-muted" htmlFor="inputGroupSelect01">{t('search_result.number_of_list_to_display')}</label>
          </div>
          <select
            defaultValue={pagingSize}
            className="custom-select"
            id="inputGroupSelect01"
            onChange={e => onPagingSizeChanged(Number(e.target.value))}
          >
            {[20, 50, 100, 200].map((limit) => {
              return <option key={limit} value={limit}>{limit} {t('search_result.page_number_unit')}</option>;
            })}
          </select>
        </div>
      </div>
      <div className="card border-warning mt-3">
        <div className="card-body">
          <h2 className="card-title text-warning">{t('private_legacy_pages.alert_title')}</h2>
          <p className="card-text">
            {t('private_legacy_pages.alert_desc1', { delete_all_selected_page: t('search_result.delete_all_selected_page') })}<br />
            {/* eslint-disable-next-line react/no-danger */}
            <span dangerouslySetInnerHTML={{ __html: t('private_legacy_pages.detail_info') }}></span>
          </p>
        </div>
      </div>
    </>
  );
});


/**
 * LegacyPage
 */

type Props = {
  appContainer: AppContainer,
}

export const PrivateLegacyPages = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const {
    appContainer,
  } = props;


  const [configurationsByPagination, setConfigurationsByPagination] = useState<Partial<ISearchConfigurations>>({
    limit: INITIAL_PAGIONG_SIZE,
  });

  const selectAllControlRef = useRef<ISelectableAndIndeterminatable|null>(null);
  const searchPageBaseRef = useRef<ISelectableAll|null>(null);

  const { data, conditions } = useSWRxNamedQuerySearch('PrivateLegacyPages', {
    limit: INITIAL_PAGIONG_SIZE,
    ...configurationsByPagination,
  });

  const selectAllCheckboxChangedHandler = useCallback((isChecked: boolean) => {
    const instance = searchPageBaseRef.current;

    if (instance == null) {
      return;
    }

    if (isChecked) {
      instance.selectAll();
    }
    else {
      instance.deselectAll();
    }
  }, []);

  const selectedPagesByCheckboxesChangedHandler = useCallback((selectedCount: number, totalCount: number) => {
    const instance = selectAllControlRef.current;

    if (instance == null) {
      return;
    }

    if (selectedCount === 0) {
      instance.deselect();
    }
    else if (selectedCount === totalCount) {
      instance.select();
    }
    else {
      instance.setIndeterminate();
    }
  }, []);

  const pagingNumberChangedHandler = useCallback((activePage: number) => {
    const currentLimit = configurationsByPagination.limit ?? INITIAL_PAGIONG_SIZE;
    setConfigurationsByPagination({
      ...configurationsByPagination,
      offset: (activePage - 1) * currentLimit,
    });
  }, [configurationsByPagination]);

  const hitsCount = data?.meta.hitsCount;

  const { offset, limit } = conditions;

  const convertAllControl = useMemo(() => {
    const isDisabled = hitsCount === 0;

    return (
      <OperateAllControl
        ref={selectAllControlRef}
        isCheckboxDisabled={isDisabled}
        onCheckboxChanged={selectAllCheckboxChangedHandler}
      >
        <UncontrolledButtonDropdown>
          <DropdownToggle caret color="outline-primary">{t('private_legacy_pages.bulk_operation')}</DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => { /* TODO: implement */ }}>
              <i className="icon-fw icon-refresh"></i>
              {t('private_legacy_pages.convert_all_selected_pages')}
            </DropdownItem>
            <DropdownItem onClick={() => { /* TODO: implement */ }}>
              <span className="text-danger">
                <i className="icon-fw icon-trash"></i>
                {t('search_result.delete_all_selected_page')}
              </span>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </OperateAllControl>
    );
  }, [hitsCount, selectAllCheckboxChangedHandler, t]);

  const searchControl = useMemo(() => {
    return (
      <div className="position-sticky fixed-top shadow-sm">
        <div className="search-control d-flex align-items-center py-md-2 py-3 px-md-4 px-3 border-bottom border-gray">
          <div className="d-flex pl-md-2">
            {convertAllControl}
          </div>
        </div>
      </div>
    );
  }, [convertAllControl]);

  const searchResultListHead = useMemo(() => {
    if (data == null) {
      return <></>;
    }
    return (
      <SearchResultListHead
        searchResult={data}
        offset={offset}
        pagingSize={limit}
        onPagingSizeChanged={() => {}}
      />
    );
  }, [data, limit, offset]);

  const searchPager = useMemo(() => {
    // when pager is not needed
    if (data == null || data.meta.hitsCount === data.meta.total) {
      return <></>;
    }

    const { total } = data.meta;
    const { offset, limit } = conditions;

    return (
      <PaginationWrapper
        activePage={Math.floor(offset / limit) + 1}
        totalItemsCount={total}
        pagingLimit={configurationsByPagination?.limit}
        changePage={pagingNumberChangedHandler}
      />
    );
  }, [conditions, configurationsByPagination?.limit, data, pagingNumberChangedHandler]);

  return (
    <SearchPageBase
      ref={searchPageBaseRef}
      appContainer={appContainer}
      pages={data?.data}
      onSelectedPagesByCheckboxesChanged={selectedPagesByCheckboxesChangedHandler}
      // Components
      searchControl={searchControl}
      searchResultListHead={searchResultListHead}
      searchPager={searchPager}
    />
  );
};
