import React, {
  FC, useState, useCallback, useRef,
} from 'react';
import { useTranslation } from 'next-i18next';
import assert from 'assert';

import AppContainer from '~/client/services/AppContainer';
import { IFocusable } from '~/client/interfaces/focusable';
import { useGlobalSearchFormRef } from '~/stores/ui';
import { IPageSearchMeta } from '~/interfaces/search';
import { IPageWithMeta } from '~/interfaces/page';

import { withUnstatedContainers } from '../UnstatedUtils';

import SearchForm from '../SearchForm';
import { useCurrentPagePath } from '~/stores/context';


type Props = {
  appContainer: AppContainer,

  dropup?: boolean,
}

const GlobalSearch: FC<Props> = (props: Props) => {
  const { appContainer, dropup } = props;
  const { t } = useTranslation();

  const globalSearchFormRef = useRef<IFocusable>(null);

  useGlobalSearchFormRef(globalSearchFormRef);

  const [text, setText] = useState('');
  const [isScopeChildren, setScopeChildren] = useState<boolean>(appContainer.getConfig().isSearchScopeChildrenAsDefault);
  const [isFocused, setFocused] = useState<boolean>(false);

  const { data: currentPagePath } = useCurrentPagePath();

  const gotoPage = useCallback((data: IPageWithMeta<IPageSearchMeta>[]) => {
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

  const isSearchServiceReachable = appContainer.getConfig().isSearchServiceReachable;

  const isIndicatorShown = !isFocused && (text.length === 0);

  return (
    <div className={`form-group mb-0 d-print-none ${isSearchServiceReachable ? '' : 'has-error'}`}>
      <div className="input-group flex-nowrap">
        <div className={`input-group-prepend ${dropup ? 'dropup' : ''}`}>
          <button className="btn btn-secondary dropdown-toggle py-0" type="button" data-toggle="dropdown" aria-haspopup="true">
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

/**
 * Wrapper component for using unstated
 */
const GlobalSearchWrapper = withUnstatedContainers(GlobalSearch, [AppContainer]);

export default GlobalSearchWrapper;
