import React, { FC } from 'react';
import PropTypes from 'prop-types';
import SearchResultListItem from './SearchResultListItem';

export interface page {
  _id: string;
  snippet: string;
  path: string;
  revision: string;
  noLink: boolean;
  lastUpdateUser: any;
}

type Props ={
  pages: page[],
  deletionMode: boolean,
  selectedPages: page[],
  onClickInvoked?: (pageId: string) => void,
  onChangeInvoked?: (page: {any}) => void,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const SearchResultListItemAny: any = SearchResultListItem;
  return (
    <>
      {props.pages.map((page) => {
        return (
          <SearchResultListItemAny
            page={page}
            onClickInvoked={props.onClickInvoked}
            noLink
          />
        );
      })}
    </>
  );

};

SearchResultList.propTypes = {
  pages: PropTypes.array.isRequired,
  deletionMode: PropTypes.bool.isRequired,
  selectedPages: PropTypes.array.isRequired,
  onClickInvoked: PropTypes.func,
  onChangeInvoked: PropTypes.func,
};

export default SearchResultList;
