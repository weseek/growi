import React, {
  FC,
} from 'react';

import SearchCore from './SearchCore';

type Props = {

}
const LegacyPage : FC<Props> = (props: Props) => {

  const onAfterSearchHandler = (keyword, searchedKeyword) => {
    let hash = window.location.hash || '';
    if (searchedKeyword !== '') {
      hash = '';
    }
    if (window.history && window.history.pushState) {
      window.history.pushState('', `Search - ${keyword}`, `/_search?q=${keyword}${hash}`);
    }
  };

  return <SearchCore onAfterSearchInvoked={onAfterSearchHandler} />;
};
export default LegacyPage;
