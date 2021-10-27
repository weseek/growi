import React, { FC } from 'react';
import SearchResultListItem from './SearchResultListItem';
import { IPage } from '../../interfaces/page';

// TOOD: retrieve bookmark count and add it to the following type
export type ISearchedPage = Omit<IPage, 'revision' | 'tags' | 'creator'> & {
  _id: string,
  snippet: string,
  revision: string,
  tags?: string[],
  creator: string,
  lastUpdateUser: any,
  seenUsers: string[],
  liker: string[],
  commentCount: number,
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
