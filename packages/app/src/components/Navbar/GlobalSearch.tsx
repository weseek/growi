import React, { useState, useCallback, useRef } from 'react';

import assert from 'assert';

import { useTranslation } from 'next-i18next';

import { IFocusable } from '~/client/interfaces/focusable';
import { IPageWithSearchMeta } from '~/interfaces/search';
import {
  useCurrentPagePath, useIsSearchScopeChildrenAsDefault, useIsSearchServiceReachable,
} from '~/stores/context';
import { useGlobalSearchFormRef } from '~/stores/ui';

import SearchForm from '../SearchForm';

import styles from './GlobalSearch.module.scss';


export type GlobalSearchProps = {
  dropup?: boolean,
}

export const GlobalSearch = (props: GlobalSearchProps): JSX.Element => {
  const { t } = useTranslation();

  const { dropup } = props;

  const globalSearchFormRef = useRef<IFocusable>(null);

  useGlobalSearchFormRef(globalSearchFormRef);

  const { data: isSearchServiceReachable } = useIsSearchServiceReachable();
  const { data: isSearchScopeChildrenAsDefault } = useIsSearchScopeChildrenAsDefault();
  const { data: currentPagePath } = useCurrentPagePath();

  const [text, setText] = useState('');
  const [isScopeChildren, setScopeChildren] = useState<boolean|undefined>(isSearchScopeChildrenAsDefault);
  const [isFocused, setFocused] = useState<boolean>(false);


  const gotoPage = useCallback((data: IPageWithSearchMeta[]) => {
    assert(data.length > 0);

    const page = data[0].data; // should be single page selected

    // navigate to page
    if (page != null) {
      window.location.href = `/${page._id}`;
    }
  }, []);

  const search = useCallback(() => {
    const url = new URL(window.location.href);
    url.pathname = '/_search';

    // construct search query
    let q = text;
    if (isScopeChildren) {
      q += ` prefix:${currentPagePath ?? window.location.pathname}`;
    }
    url.searchParams.append('q', q);

    window.location.href = url.href;
  }, [currentPagePath, isScopeChildren, text]);

  const scopeLabel = isScopeChildren
    ? t('header_search_box.label.This tree')
    : t('header_search_box.label.All pages');

  const isIndicatorShown = !isFocused && (text.length === 0);

  if (isScopeChildren == null || isSearchServiceReachable == null) {
    return <></>;
  }

  return (
    <div className={`grw-global-search ${styles['grw-global-search']} form-group mb-0 d-print-none ${isSearchServiceReachable ? '' : 'has-error'}`}>
      <div className="input-group flex-nowrap">
        <div className={`input-group-prepend ${dropup ? 'dropup' : ''}`}>
          <button
            className="btn btn-secondary dropdown-toggle py-0"
            type="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            data-testid="select-search-scope"
          >
            {scopeLabel}
          </button>
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              type="button"
              onClick={() => {
                setScopeChildren(false);
                globalSearchFormRef.current?.focus();
              }}
            >
              { t('header_search_box.item_label.All pages') }
            </button>
            <button
              data-tesid="search-current-tree"
              className="dropdown-item"
              type="button"
              onClick={() => {
                setScopeChildren(true);
                globalSearchFormRef.current?.focus();
              }}
            >
              { t('header_search_box.item_label.This tree') }
            </button>
          </div>
        </div>
        <SearchForm
          ref={globalSearchFormRef}
          isSearchServiceReachable={isSearchServiceReachable}
          dropup={dropup}
          onChange={gotoPage}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          onInputChange={text => setText(text)}
          onSubmit={search}
        />
        { isIndicatorShown && (
          <span className="grw-shortcut-key-indicator">
            <code className="bg-transparent text-muted">/</code>
          </span>
        ) }
      </div>
    </div>
  );
};
