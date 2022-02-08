import React, { FC } from 'react';
import { IPageInfoForEntity, IPageWithMeta, isIPageInfoForListing } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';
import { useSWRxPageInfoForList } from '~/stores/page';

import { PageListItemL } from '../PageList/PageListItemL';
import PaginationWrapper from '../PaginationWrapper';


type Props = {
  pages: IPageWithMeta<IPageInfoForEntity & IPageSearchMeta>[],
  selectedPagesIdList: Set<string>
  isEnableActions: boolean,
  searchResultCount?: number,
  activePage?: number,
  pagingLimit?: number,
  focusedSearchResultData?: IPageWithMeta<IPageSearchMeta>,
  onPagingNumberChanged?: (activePage: number) => void,
  onClickItem?: (pageId: string) => void,
  onClickCheckbox?: (pageId: string) => void,
  onClickInvoked?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const {
    pages, focusedSearchResultData, selectedPagesIdList, isEnableActions,
  } = props;

  const pageIdsWithNoSnippet = pages
    .filter(page => (page.pageMeta?.elasticSearchResult?.snippet.length ?? 0) === 0)
    .map(page => page.pageData._id);

  const { data: idToPageInfo } = useSWRxPageInfoForList(pageIdsWithNoSnippet);

  let injectedPage;
  // inject data to list
  if (idToPageInfo != null) {
    injectedPage = pages.map((page) => {
      const pageInfo = idToPageInfo[page.pageData._id];

      if (!isIPageInfoForListing(pageInfo)) {
        // return as is
        return page;
      }

      return {
        pageData: page.pageData,
        pageMeta: {
          ...page.pageMeta,
          revisionShortBody: pageInfo.revisionShortBody,
        },
      };
    });
  }

  const focusedPageId = (focusedSearchResultData != null && focusedSearchResultData.pageData != null) ? focusedSearchResultData.pageData._id : '';
  return (
    <ul className="page-list-ul list-group list-group-flush">
      { (injectedPage ?? pages).map((page) => {
        const isChecked = selectedPagesIdList.has(page.pageData._id);

        return (
          <PageListItemL
            key={page.pageData._id}
            page={page}
            isEnableActions={isEnableActions}
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
