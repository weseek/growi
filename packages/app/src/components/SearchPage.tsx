import React, { FC } from 'react';
import Search from './Search';

type Props = {

}
const SearchPage: FC<Props> = (props: Props) => {
  const actionToPages = () => {

  };
  return <Search actionToPages={actionToPages}></Search>;
};


export default SearchPage;
