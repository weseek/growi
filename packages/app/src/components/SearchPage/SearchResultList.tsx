import React, { FC } from 'react';
import SearchResultListItem from './SearchResultListItem';
import { IPageHasId } from '../../interfaces/page';

// TOOD: retrieve bookmark count and add it to the following type
export type ISearchedPage = IPageHasId & {
  snippet: string,
  elasticSearchResult: {
    snippet: string,
    matchedPath: string,
  },
};

type Props = {
  pages: ISearchedPage[],
  deletionMode: boolean,
  selectedPages: ISearchedPage[],
  onClickInvoked?: (pageId: string) => void,
}

const SearchResultList: FC<Props> = (props:Props) => {
  return (
    <>
      {props.pages.map((page) => {
        return (
          <SearchResultListItem
            page={page}
            onClickInvoked={props.onClickInvoked}
          />
        );
      })}
    </>
  );

};

export default SearchResultList;
