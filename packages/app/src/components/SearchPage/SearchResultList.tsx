import React, { FC } from 'react';
import SearchResultListItem from './SearchResultListItem';
import PaginationWrapper from '../PaginationWrapper';
import { IPageSearchResultData } from '../../interfaces/search';


type Props = {
  pages: IPageSearchResultData[],
  selectedPages: IPageSearchResultData[],
  onClickInvoked?: (pageId: string) => void,
  searchResultCount?: number,
  activePage?: number,
  pagingLimit?: number,
  onPagingNumberChanged?: (activePage: number) => void,
  focusedPage?: IPageSearchResultData,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const { focusedPage } = props;
  const focusedPageId = (focusedPage !== undefined && focusedPage.pageData !== undefined) ? focusedPage.pageData._id : '';
  return (
    <>
      {props.pages.map((page) => {
        return (
          <SearchResultListItem
            key={page.pageData._id}
            page={page}
            onClickInvoked={props.onClickInvoked}
            isSelected={page.pageData._id === focusedPageId || false}
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
