import React, { FC, useState } from 'react';
import Search from './Search';

type Props = {

}
const SearchPage: FC<Props> = (props: Props) => {
  const [searchedKeyword, setSearchedKeyword] = useState('');
  // search()


  const actionToPages = () => {

  };

  const changeURL = (keyword, refreshHash) => {
    let hash = window.location.hash || '';
    // TODO 整理する
    if (refreshHash || searchedKeyword !== '') {
      hash = '';
    }
    if (window.history && window.history.pushState) {
      window.history.pushState('', `Search - ${keyword}`, `/_search?q=${keyword}${hash}`);
    }
  };
  return (
    <Search onActionToPagesInvoked={actionToPages} onChnageURLInvoked={changeURL}></Search>
  );
};


export default SearchPage;
