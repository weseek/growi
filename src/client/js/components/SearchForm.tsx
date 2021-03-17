import React, { FC, useState } from 'react';

import { useTranslation } from '~/i18n';
import { useSearchServiceReachable } from '~/stores/context';


import SearchTypeahead from './SearchTypeahead';


const HelpElement = () => {
  const { t } = useTranslation();
  const { data: isReachable } = useSearchServiceReachable();

  if (!isReachable) {
    return (
      <>
        <h5 className="text-danger">Error occured on Search Service</h5>
        Try to reconnect from management page.
      </>
    );
  }

  return (
    <table className="table grw-search-table search-help m-0">
      <caption className="text-left text-primary p-2">
        <h5 className="h6"><i className="icon-magnifier pr-2 mb-2" />{ t('search_help.title') }</h5>
      </caption>
      <tbody>
        <tr>
          <th className="py-2">
            <code>word1</code> <code>word2</code><br></br>
            <small>({ t('search_help.and.syntax help') })</small>
          </th>
          <td><h6 className="m-0">{ t('search_help.and.desc', { word1: 'word1', word2: 'word2' }) }</h6></td>
        </tr>
        <tr>
          <th className="py-2">
            <code>&quot;This is GROWI&quot;</code><br></br>
            <small>({ t('search_help.phrase.syntax help') })</small>
          </th>
          <td><h6 className="m-0">{ t('search_help.phrase.desc', { phrase: 'This is GROWI' }) }</h6></td>
        </tr>
        <tr>
          <th className="py-2"><code>-keyword</code></th>
          <td><h6 className="m-0">{ t('search_help.exclude.desc', { word: 'keyword' }) }</h6></td>
        </tr>
        <tr>
          <th className="py-2"><code>prefix:/user/</code></th>
          <td><h6 className="m-0">{ t('search_help.prefix.desc', { path: '/user/' }) }</h6></td>
        </tr>
        <tr>
          <th className="py-2"><code>-prefix:/user/</code></th>
          <td><h6 className="m-0">{ t('search_help.exclude_prefix.desc', { path: '/user/' }) }</h6></td>
        </tr>
        <tr>
          <th className="py-2"><code>tag:wiki</code></th>
          <td><h6 className="m-0">{ t('search_help.tag.desc', { tag: 'wiki' }) }</h6></td>
        </tr>
        <tr>
          <th className="py-2"><code>-tag:wiki</code></th>
          <td><h6 className="m-0">{ t('search_help.exclude_tag.desc', { tag: 'wiki' }) }</h6></td>
        </tr>
      </tbody>
    </table>
  );
};


type Props = {
  dropup?: boolean,
  keyword?: string,
  onSubmit: () => void,
  onInputChange?: (string) => void,
}

const SearchForm: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const [searchError, setSearchError] = useState(null);
  const [isShownHelp, setIsShownHelp] = useState(false);
  const { data: isReachable } = useSearchServiceReachable();

  const { dropup } = props;

  function onChange(selected) {
    const page = selected[0]; // should be single page selected

    // navigate to page
    if (page != null) {
      window.location = page.path;
    }
  }

  const placeholder = isReachable
    ? 'Search ...'
    : 'Error on Search Service';
  const emptyLabel = (searchError != null)
    ? 'Error on searching.'
    : t('search.search page bodies');

  return (
    <SearchTypeahead
      dropup={dropup}
      onChange={onChange}
      onSubmit={props.onSubmit}
      onInputChange={props.onInputChange}
      onSearchError={setSearchError}
      emptyLabel={emptyLabel}
      placeholder={placeholder}
      helpElement={isShownHelp ? <HelpElement /> : <></>}
      keywordOnInit={props.keyword}
      onBlur={() => setIsShownHelp(false)}
      onFocus={() => setIsShownHelp(true)}
    />
  );
};


export default SearchForm;
