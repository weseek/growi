import React, {
  FC, forwardRef, ForwardRefRenderFunction, useImperativeHandle,
  useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { IFocusable } from '~/client/interfaces/focusable';
import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';

import SearchTypeahead from './SearchTypeahead';


type SearchFormHelpProps = {
  isReachable: boolean,
  isShownHelp: boolean,
}

const SearchFormHelp: FC<SearchFormHelpProps> = (props: SearchFormHelpProps) => {
  const { t } = useTranslation();

  const { isReachable, isShownHelp } = props;

  if (!isReachable) {
    return (
      <>
        <h5 className="text-danger">Error occured on Search Service</h5>
        Try to reconnect from management page.
      </>
    );
  }

  if (!isShownHelp) {
    return <></>;
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
  isSearchServiceReachable: boolean,

  dropup?: boolean,
  keyword?: string,
  onChange?: (data: IPageWithMeta<IPageSearchMeta>[]) => void,
  onBlur?: () => void,
  onFocus?: () => void,
  onSubmit?: (input: string) => void,
  onInputChange?: (text: string) => void,
};


const SearchForm: ForwardRefRenderFunction<IFocusable, Props> = (props: Props, ref) => {
  const { t } = useTranslation();
  const {
    isSearchServiceReachable, dropup,
    onChange, onBlur, onFocus, onSubmit, onInputChange,
  } = props;

  const [searchError, setSearchError] = useState<Error | null>(null);
  const [isShownHelp, setShownHelp] = useState(false);

  const searchTyheaheadRef = useRef<IFocusable>(null);

  // publish focus()
  useImperativeHandle(ref, () => ({
    focus() {
      const instance = searchTyheaheadRef?.current;
      if (instance != null) {
        instance.focus();
      }
    },
  }));

  const placeholder = isSearchServiceReachable
    ? 'Search ...'
    : 'Error on Search Service';

  const emptyLabel = (searchError != null)
    ? 'Error on searching.'
    : t('search.search page bodies');

  return (
    <SearchTypeahead
      ref={searchTyheaheadRef}
      dropup={dropup}
      emptyLabel={emptyLabel}
      placeholder={placeholder}
      onChange={onChange}
      onSubmit={onSubmit}
      onInputChange={onInputChange}
      onSearchError={err => setSearchError(err)}
      onBlur={() => {
        setShownHelp(false);
        if (onBlur != null) {
          onBlur();
        }
      }}
      onFocus={() => {
        setShownHelp(true);
        if (onFocus != null) {
          onFocus();
        }
      }}
      helpElement={<SearchFormHelp isShownHelp={isShownHelp} isReachable={isSearchServiceReachable} />}
      keywordOnInit={props.keyword}
    />
  );
};

export default forwardRef(SearchForm);
