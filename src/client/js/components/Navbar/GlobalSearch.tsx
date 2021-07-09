import React, { FC, useCallback, useState } from 'react';
import { useRouter } from 'next/router'

import { useTranslation } from '~/i18n';
import { useSearchServiceReachable } from '~/stores/context';

import SearchForm from '../SearchForm';


// eslint-disable-next-line react/prop-types
const GlobalSearchFormGroup = ({ children }) => {
  const { data: isReachable } = useSearchServiceReachable();

  return (
    <div className={`form-group mb-0 d-print-none ${isReachable ? '' : 'has-error'}`}>
      {children}
    </div>
  );
};


type Props = {
  dropup: boolean,
}

const GlobalSearch: FC<Props> = (props: Props) => {
  const router = useRouter();

  const { t } = useTranslation();

  const [text, setText] = useState('');
  const [isScopeChildren, setScopeChildren] = useState(false);

  const onClickAllPages = useCallback(() => {
    setScopeChildren(false);
  }, [setScopeChildren]);

  const onClickChildren = useCallback(() => {
    setScopeChildren(true);
  }, [setScopeChildren]);

  const search = useCallback(() => {
    const url = new URL(window.location.href);
    url.pathname = '/_search';

    // construct search query
    let q = text;
    if (isScopeChildren) {
      q += ` prefix:${window.location.pathname}`;
    }
    url.searchParams.append('q', q);

    router.push(url.href);
  }, [text, isScopeChildren]);

  const { dropup } = props;
  const scopeLabel = isScopeChildren
    ? t('header_search_box.label.This tree')
    : t('header_search_box.label.All pages');

  return (
    <GlobalSearchFormGroup>
      <div className="input-group flex-nowrap">
        <div className={`input-group-prepend ${dropup ? 'dropup' : ''}`}>
          <button className="btn btn-secondary dropdown-toggle py-0" type="button" data-toggle="dropdown" aria-haspopup="true">
            {scopeLabel}
          </button>
          <div className="dropdown-menu">
            <button className="dropdown-item" type="button" onClick={onClickAllPages}>{ t('header_search_box.item_label.All pages') }</button>
            <button className="dropdown-item" type="button" onClick={onClickChildren}>{ t('header_search_box.item_label.This tree') }</button>
          </div>
        </div>
        <SearchForm
          onInputChange={value => setText(value)}
          onSubmit={search}
          dropup={dropup}
        />
        <div className="btn-group-submit-search">
          <span className="btn-link text-decoration-none" onClick={search}>
            <i className="icon-magnifier"></i>
          </span>
        </div>
      </div>
    </GlobalSearchFormGroup>
  );

};

export default GlobalSearch;
