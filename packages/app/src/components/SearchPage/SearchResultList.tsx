import React, { FC, useCallback, useState } from 'react';
import { IPageWithMeta, isIPageInfoForListing } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';
import { useIsGuestUser } from '~/stores/context';
import { useSWRxPageInfoForList } from '~/stores/page';

import { PageListItemL } from '../PageList/PageListItemL';
import PaginationWrapper from '../PaginationWrapper';


type Props = {
  pages: IPageWithMeta<IPageSearchMeta>[],
  isCheckedAllItems?: boolean,
  searchResultCount?: number,
  activePage?: number,
  pagingLimit?: number,
  onPagingNumberChanged?: (activePage: number) => void,
  onPageSelected?: (page?: IPageWithMeta<IPageSearchMeta>) => void,
  onClickCheckbox?: (pageId: string) => void,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const {
    pages, isCheckedAllItems,
    onPageSelected,
  } = props;

  const [selectedPageId, setSelectedPageId] = useState<string>();

  const pageIdsWithNoSnippet = pages
    .filter(page => (page.pageMeta?.elasticSearchResult?.snippet.length ?? 0) === 0)
    .map(page => page.pageData._id);

  const { data: isGuestUser } = useIsGuestUser();
  const { data: idToPageInfo } = useSWRxPageInfoForList(pageIdsWithNoSnippet);

  const clickItemHandler = useCallback((pageId: string) => {
    setSelectedPageId(pageId);

    if (onPageSelected != null) {
      const selectedPage = pages.find(page => page.pageData._id === pageId);
      onPageSelected(selectedPage);
    }
  }, [onPageSelected, pages]);

  const clickDeleteButtonHandler = useCallback((pageId: string) => {
    // TODO implement
  }, []);

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

  return (
    <ul className="page-list-ul list-group list-group-flush">
      { (injectedPage ?? pages).map((page) => {
        return (
          <PageListItemL
            key={page.pageData._id}
            page={page}
            isCheckedAllItems={isCheckedAllItems}
            isEnableActions={isGuestUser}
            isSelected={page.pageData._id === selectedPageId}
            onClickItem={clickItemHandler}
            onClickCheckbox={props.onClickCheckbox}
            onClickDeleteButton={clickDeleteButtonHandler}
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
