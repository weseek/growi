import React, { useCallback } from 'react';

import { PagePathLabel, UserPicture } from '@growi/ui/dist/components';
import { useDebounce } from 'usehooks-ts';

import { useSWRxSearch } from '~/stores/search';

import { SearchMenuItem } from './SearchMenuItem';

type Props = {
  searchKeyword: string,
  getItemProps: any,
  highlightedIndex: number | null,
}
export const SearchResultMenuItem = (props: Props): JSX.Element => {
  const { searchKeyword, highlightedIndex, getItemProps } = props;

  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const isEmptyKeyword = searchKeyword.trim().length === 0;

  const { data: searchResult, isLoading } = useSWRxSearch(isEmptyKeyword ? null : debouncedKeyword, null, { limit: 10 });

  const getFiexdIndex = useCallback((index: number | null) => {
    if (index == null) {
      return -1;
    }

    return (isEmptyKeyword ? 1 : 3) + index;
  }, [isEmptyKeyword]);

  if (isLoading) {
    return (
      <>
        Searching...
        <div className="border-top mt-3" />
      </>
    );
  }

  if (isEmptyKeyword || searchResult == null || searchResult.data.length === 0) {
    return <></>;
  }

  return (
    <>
      {searchResult?.data
        .map((item, index) => (
          <SearchMenuItem key={item.data._id} index={getFiexdIndex(index)} highlightedIndex={highlightedIndex} getItemProps={getItemProps} url={item.data._id}>
            <UserPicture user={item.data.creator} />

            <span className="ms-3 text-break text-wrap">
              <PagePathLabel path={item.data.path} />
            </span>

            <span className="ms-2 text-muted d-flex justify-content-center align-items-center">
              <span className="material-symbols-outlined fs-5">footprint</span>
              <span>{item.data.seenUsers.length}</span>
            </span>
          </SearchMenuItem>
        ))
      }
      <div className="border-top mt-3" />
    </>
  );
};
