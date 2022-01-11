import React, {
  FC,
} from 'react';
import SearchCore from './SearchCore';

type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. set excluded hoge based on props
// 2. hide sort bar when this component is used in legacyPage
// 3. disable search form when this component is used in LegacyPage
// 4. refactor DeleteSelectedPageGroup component in a way that  SearchPage and LegacyPage can get actionToPage through props
// 5. onAfterSearchInvoked should be refactored in LegacyPage
const SearchPage : FC<Props> = (props: Props) => {
  const onAfterSearchHandler = (keyword, searchedKeyword) => {
    let hash = window.location.hash || '';
    if (searchedKeyword !== '') {
      hash = '';
    }
    if (window.history && window.history.pushState) {
      window.history.pushState('', `Search - ${keyword}`, `/_search?q=${keyword}${hash}`);
    }
  };

  const actionToPages = () => {

  };


  return <SearchCore onAfterSearchInvoked={onAfterSearchHandler} />;
};
export default SearchPage;
