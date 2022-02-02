import React, { FC } from 'react';
import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';

import { PageListItemL } from '../PageList/PageListItemL';
import PaginationWrapper from '../PaginationWrapper';


type Props = {
  pages: IPageWithMeta<IPageSearchMeta>[],
  selectedPagesIdList: Set<string>
  isEnableActions: boolean,
  searchResultCount?: number,
  activePage?: number,
  pagingLimit?: number,
  shortBodiesMap?: Record<string, string>
  focusedSearchResultData?: IPageWithMeta<IPageSearchMeta>,
  onPagingNumberChanged?: (activePage: number) => void,
  onClickItem?: (pageId: string) => void,
  onClickCheckbox?: (pageId: string) => void,
  onClickInvoked?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const {
    focusedSearchResultData, selectedPagesIdList, isEnableActions, shortBodiesMap,
  } = props;

  const focusedPageId = (focusedSearchResultData != null && focusedSearchResultData.pageData != null) ? focusedSearchResultData.pageData._id : '';
  return (
    <ul className="page-list-ul list-group list-group-flush">
      {Array.isArray(props.pages) && props.pages.map((page) => {
        const isChecked = selectedPagesIdList.has(page.pageData._id);

        return (
          <PageListItemL
            key={page.pageData._id}
            page={page}
            isEnableActions={isEnableActions}
            shortBody={shortBodiesMap?.[page.pageData._id]}
            onClickItem={props.onClickItem}
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

    </ul>
  );

};

export default SearchResultList;
