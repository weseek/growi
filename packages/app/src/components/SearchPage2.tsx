import React from 'react';

import AppContainer from '~/client/services/AppContainer';

import { useSWRxFullTextSearch } from '~/stores/search';

import SearchPageBase from './SearchPage2/SearchPageBase';


type Props = {
  appContainer: AppContainer,
}

export const SearchPage = (props: Props): JSX.Element => {

  const {
    appContainer,
  } = props;

  const { data } = useSWRxFullTextSearch('sand', {
    limit: 20,
  });

  return (
    <SearchPageBase
      appContainer={appContainer}
      pages={data?.data}
      SearchControl={() => (
        <></>
      )}
      SearchResultListHead={() => (
        <></>
      )}
    />
  );
};
