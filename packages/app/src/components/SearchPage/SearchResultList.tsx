import React, { FC } from 'react';
import SearchResultListItem from './SearchResultListItem';
import PaginationWrapper from '../PaginationWrapper';
import { IPageSearchResultData } from '../../interfaces/search';


type Props = {
  pages: IPageSearchResultData[],
  selectedPagesIdList: Set<string>
  searchResultCount?: number,
  activePage?: number,
  pagingLimit?: number,
  focusedSearchResultData?: IPageSearchResultData,
  onPagingNumberChanged?: (activePage: number) => void,
  onClickSearchResultItem?: (pageId: string) => void,
  onClickCheckbox?: (pageId: string) => void,
  onClickInvoked?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const { focusedSearchResultData, selectedPagesIdList } = props;

  const focusedPageId = (focusedSearchResultData != null && focusedSearchResultData.pageData != null) ? focusedSearchResultData.pageData._id : '';
  return (
    <>
      {Array.isArray(props.pages) && props.pages.map((page) => {
        const isChecked = selectedPagesIdList.has(page.pageData._id);

        return (
          <SearchResultListItem
            key={page.pageData._id}
            page={page}
            onClickSearchResultItem={props.onClickSearchResultItem}
            onClickCheckbox={props.onClickCheckbox}
            isChecked={isChecked}
            isSelected={page.pageData._id === focusedPageId || false}
            onClickDeleteButton={props.onClickDeleteButton}
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
