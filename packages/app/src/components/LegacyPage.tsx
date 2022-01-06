import React, { FC } from 'react';
import Search from './Search';

type Props = {

}

const LegacyPage: FC<Props> = (props: Props) => {
  const actionToPages = () => {};
  return (
    <Search disableControlOptions actionToPages={actionToPages}></Search>
  );
};


export default LegacyPage;
