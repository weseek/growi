import React, { FC } from 'react';
import SearchResultListItem from './SearchResultListItem';

export type Page = {
  _id: string;
  snippet: string;
  path: string;
  revision: string;
  noLink: boolean;
  lastUpdateUser: any;
}

type Props = {
  pages: Page[],
  deletionMode: boolean,
  selectedPages: Page[],
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
