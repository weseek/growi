import React, { FC, useCallback } from 'react';
import { IPageWithMeta, isIPageInfoForListing } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';
import { useIsGuestUser } from '~/stores/context';
import { useSWRxPageInfoForList } from '~/stores/page';

import { PageListItemL } from '../PageList/PageListItemL';


type Props = {
  pages: IPageWithMeta<IPageSearchMeta>[],
  selectedPageId?: string,
  onPageSelected?: (page?: IPageWithMeta<IPageSearchMeta>) => void,
  onClickCheckbox?: (pageId: string) => void,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const {
    pages, selectedPageId,
    onPageSelected,
  } = props;

  const pageIdsWithNoSnippet = pages
    .filter(page => (page.pageMeta?.elasticSearchResult?.snippet.length ?? 0) === 0)
    .map(page => page.pageData._id);

  const { data: isGuestUser } = useIsGuestUser();
  const { data: idToPageInfo } = useSWRxPageInfoForList(pageIdsWithNoSnippet);

  const clickItemHandler = useCallback((pageId: string) => {
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
            isEnableActions={isGuestUser}
            isSelected={page.pageData._id === selectedPageId}
            onClickItem={clickItemHandler}
            onClickCheckbox={props.onClickCheckbox}
            onClickDeleteButton={clickDeleteButtonHandler}
          />
        );
      })}
    </ul>
  );

};

export default SearchResultList;
