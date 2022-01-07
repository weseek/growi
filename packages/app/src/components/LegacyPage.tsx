import React, { FC, useState } from 'react';
import Search from './Search';

type Props = {
}

const LegacyPage: FC<Props> = (props: Props) => {
  const [searchedKeyword, setSearchedKeyword] = useState('');
  // search()


  const changeURL = (keyword, refreshHash) => {
    console.log('TODO: changeURL for legacy');
  };


  const actionToPages = () => {};

  return (
    <Search disableControlOptions onActionToPagesInvoked={actionToPages} onChnageURLInvoked={changeURL}></Search>
  );
};


export default LegacyPage;
