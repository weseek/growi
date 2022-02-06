import React, { useState } from 'react';
import {
  IPageHasId, IPageWithMeta,
} from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';
import { useIsGuestUser } from '~/stores/context';

import { useSWRxPageInfoForList, useSWRxPageList } from '~/stores/page';

import PageList from './PageList/PageList';
import PaginationWrapper from './PaginationWrapper';

type Props = {
  path: string,
}


const convertToIPageWithEmptyMeta = (page: IPageHasId): IPageWithMeta => {
  return { pageData: page };
};

const DescendantsPageList = (props: Props): JSX.Element => {
  const { path } = props;

  const [activePage, setActivePage] = useState(1);

  const { data: isGuestUser } = useIsGuestUser();

  const { data: pagingResult, error } = useSWRxPageList(path, activePage);

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { data: idToPageInfo } = useSWRxPageInfoForList(pageIds);

  let pagingResultWithMeta: IPagingResult<IPageWithMeta> | undefined;

  // initial data
  if (pagingResult != null) {
    const pages = pagingResult.items;

    // convert without meta at first
    pagingResultWithMeta = {
      ...pagingResult,
      items: pages.map(page => convertToIPageWithEmptyMeta(page)),
    };
  }

  // inject data for listing
  if (pagingResult != null) {
    const pages = pagingResult.items;

    const pageWithMetas = pages.map((page) => {
      const pageInfo = (idToPageInfo ?? {})[page._id];

      return {
        pageData: page,
        pageMeta: pageInfo,
      } as IPageWithMeta;
    });

    pagingResultWithMeta = {
      ...pagingResult,
      items: pageWithMetas,
    };
  }

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
  }

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error.message}</div>
      </div>
    );
  }

  if (pagingResult == null || pagingResultWithMeta == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageList pages={pagingResultWithMeta} isEnableActions={!isGuestUser} />

      <div className="my-4">
        <PaginationWrapper
          activePage={activePage}
          changePage={setPageNumber}
          totalItemsCount={pagingResult.totalCount}
          pagingLimit={pagingResult.limit}
          align="center"
        />
      </div>
    </>
  );
};

export default DescendantsPageList;
