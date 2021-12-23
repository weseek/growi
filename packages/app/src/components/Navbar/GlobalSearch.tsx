import React, {
  FC, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import assert from 'assert';

import AppContainer from '~/client/services/AppContainer';
import { IPageSearchResultData } from '~/interfaces/search';

import { withUnstatedContainers } from '../UnstatedUtils';

import SearchForm from '../SearchForm';


type Props = {
  appContainer: AppContainer,

  dropup?: boolean,
}

const GlobalSearch: FC<Props> = (props: Props) => {
  const { appContainer, dropup } = props;
  const { t } = useTranslation();

  const [text, setText] = useState('');
  const [isScopeChildren, setScopeChildren] = useState<boolean>(appContainer.getConfig().isSearchScopeChildrenAsDefault);

  const gotoPage = useCallback((data: IPageSearchResultData[]) => {
    assert(data.length > 0);

    const page = data[0].pageData; // should be single page selected

    // navigate to page
    if (page != null) {
      window.location.href = page._id;
    }
  }, []);

  const search = useCallback(() => {
    const url = new URL(window.location.href);
    url.pathname = '/_search';

    // construct search query
    let q = text;
    if (isScopeChildren) {
      q += ` prefix:${window.location.pathname}`;
    }
    url.searchParams.append('q', q);

    window.location.href = url.href;
  }, [isScopeChildren, text]);

  const scopeLabel = isScopeChildren
    ? t('header_search_box.label.This tree')
    : t('header_search_box.label.All pages');

  const isSearchServiceReachable = appContainer.getConfig().isSearchServiceReachable;

  return (
    <div className={`form-group mb-0 d-print-none ${isSearchServiceReachable ? '' : 'has-error'}`}>
      <div className="input-group flex-nowrap">
        <div className={`input-group-prepend ${dropup ? 'dropup' : ''}`}>
          <button className="btn btn-secondary dropdown-toggle py-0" type="button" data-toggle="dropdown" aria-haspopup="true">
            {scopeLabel}
          </button>
          <div className="dropdown-menu">
            <button className="dropdown-item" type="button" onClick={() => setScopeChildren(false)}>
              { t('header_search_box.item_label.All pages') }
            </button>
            <button className="dropdown-item" type="button" onClick={() => setScopeChildren(true)}>
              { t('header_search_box.item_label.This tree') }
            </button>
          </div>
        </div>
        <SearchForm
          isSearchServiceReachable={isSearchServiceReachable}
          dropup={dropup}
          onChange={gotoPage}
          onInputChange={text => setText(text)}
          onSubmit={search}
        />
      </div>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const GlobalSearchWrapper = withUnstatedContainers(GlobalSearch, [AppContainer]);

export default GlobalSearchWrapper;
