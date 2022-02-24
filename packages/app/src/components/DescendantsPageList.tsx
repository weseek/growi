import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastSuccess } from '~/client/util/apiNotification';
import {
  IPageHasId, IPageWithMeta,
} from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useIsGuestUser, useIsSharedUser } from '~/stores/context';

import { useSWRxDescendantsPageListForCurrrentPath, useSWRxPageInfoForList, useSWRxPageList } from '~/stores/page';
import { usePageTreeTermManager } from '~/stores/page-listing';

import PageList from './PageList/PageList';
import PaginationWrapper from './PaginationWrapper';


type SubstanceProps = {
  pagingResult: IPagingResult<IPageHasId> | undefined,
  activePage: number,
  setActivePage: (activePage: number) => void,
  onPagesDeleted?: OnDeletedFunction,
}

const convertToIPageWithEmptyMeta = (page: IPageHasId): IPageWithMeta => {
  return { pageData: page };
};

export const DescendantsPageListSubstance = (props: SubstanceProps): JSX.Element => {

  const { t } = useTranslation();

  const {
    pagingResult, activePage, setActivePage, onPagesDeleted,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { data: idToPageInfo } = useSWRxPageInfoForList(pageIds, true);

  let pagingResultWithMeta: IPagingResult<IPageWithMeta> | undefined;

  // for mutation
  const { advance: advancePt } = usePageTreeTermManager();

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

  const pageDeletedHandler: OnDeletedFunction = useCallback((...args) => {
    toastSuccess(args[2] ? t('deleted_pages_completely') : t('deleted_pages'));

    advancePt();

    if (onPagesDeleted != null) {
      onPagesDeleted(...args);
    }
  }, [advancePt, onPagesDeleted, t]);

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
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

  const showPager = pagingResult.items.length > pagingResult.limit;

  return (
    <>
      <PageList
        pages={pagingResultWithMeta}
        isEnableActions={!isGuestUser}
        onPagesDeleted={pageDeletedHandler}
      />

      { showPager && (
        <div className="my-4">
          <PaginationWrapper
            activePage={activePage}
            changePage={setPageNumber}
            totalItemsCount={pagingResult.totalCount}
            pagingLimit={pagingResult.limit}
            align="center"
          />
        </div>
      ) }
    </>
  );
};

type Props = {
  path: string,
}

export const DescendantsPageList = (props: Props): JSX.Element => {
  const { path } = props;

  const [activePage, setActivePage] = useState(1);

  const { data: isSharedUser } = useIsSharedUser();

  const { data: pagingResult, error, mutate } = useSWRxPageList(isSharedUser ? null : path, activePage);

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error.message}</div>
      </div>
    );
  }

  return (
    <DescendantsPageListSubstance
      pagingResult={pagingResult}
      activePage={activePage}
      setActivePage={setActivePage}
      onPagesDeleted={() => mutate()}
    />
  );
};

export const DescendantsPageListForCurrentPath = (): JSX.Element => {

  const [activePage, setActivePage] = useState(1);
  const { data: pagingResult, error, mutate } = useSWRxDescendantsPageListForCurrrentPath(activePage);

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error.message}</div>
      </div>
    );
  }

  return (
    <DescendantsPageListSubstance
      pagingResult={pagingResult}
      activePage={activePage}
      setActivePage={setActivePage}
      onPagesDeleted={() => mutate()}
    />
  );

};
