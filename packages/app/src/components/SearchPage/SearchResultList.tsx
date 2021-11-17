import React, { FC } from 'react';
import SearchResultListItem from './SearchResultListItem';
import { IPageHasId } from '../../interfaces/page';
import PaginationWrapper from '../PaginationWrapper';

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
  selectedPagesIdList: Set<string>
  onClickInvoked?: (pageId: string) => void,
  onChangedInvoked?: (page: string) => void,
  searchResultCount?: number,
  activePage?: number,
  pagingLimit?: number,
  onPagingNumberChanged?: (activePage: number) => void,
  focusedPage?: ISearchedPage,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const { focusedPage, selectedPagesIdList } = props;
  const focusedPageId = focusedPage != null && focusedPage._id != null ? focusedPage._id : '';

  return (
    <>
      {Array.isArray(props.pages) && props.pages.map((page) => {
        const isChecked = selectedPagesIdList.has(page._id);
        return (
          <SearchResultListItem
            key={page._id}
            page={page}
            onClickInvoked={props.onClickInvoked}
            onClickCheckboxInvoked={props.onChangedInvoked}
            isSelected={page._id === focusedPageId || false}
            isChecked={isChecked}
          />
        );
      })}
      {props.searchResultCount != null && props.searchResultCount > 0 && (
        <div className="my-4 mx-auto">
          <PaginationWrapper
            activePage={props.activePage || 1}
            changePage={props.onPagingNumberChanged}
            totalItemsCount={props.searchResultCount || 0}
            pagingLimit={props.pagingLimit}
          />
        </div>
      )}

    </>
  );

};

export default SearchResultList;
