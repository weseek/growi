import React, { FC } from 'react';
import SearchResultListItem from './SearchResultListItem';
import { IPage } from '../../interfaces/page';

export type ISearchedPage = IPage & {
  _id: string,
  snippet: string,
  noLink: boolean,
  lastUpdateUser: any,
  elasticSearchResult: {
    snippet: string,
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
