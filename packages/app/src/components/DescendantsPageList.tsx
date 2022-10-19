import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/apiNotification';
import {
  IDataWithMeta,
  IPageHasId,
  IPageInfoForOperation,
} from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';
import { OnDeletedFunction, OnPutBackedFunction } from '~/interfaces/ui';
import {
  useIsGuestUser, useIsSharedUser, useIsTrashPage, useShowPageLimitationXL,
} from '~/stores/context';
import {
  usePageTreeTermManager, useDescendantsPageListForCurrentPathTermManager, useSWRxDescendantsPageListForCurrrentPath,
  useSWRxPageInfoForList, useSWRxPageList,
} from '~/stores/page-listing';

import { ForceHideMenuItems, MenuItemType } from './Common/Dropdown/PageItemControl';
import PageList from './PageList/PageList';
import PaginationWrapper from './PaginationWrapper';


type SubstanceProps = {
  pagingResult: IPagingResult<IPageHasId> | undefined,
  activePage: number,
  setActivePage: (activePage: number) => void,
  forceHideMenuItems?: ForceHideMenuItems,
  onPagesDeleted?: OnDeletedFunction,
  onPagePutBacked?: OnPutBackedFunction,
}

const convertToIDataWithMeta = (page: IPageHasId): IDataWithMeta<IPageHasId> => {
  return { data: page };
};

export const DescendantsPageListSubstance = (props: SubstanceProps): JSX.Element => {

  const { t } = useTranslation();

  const {
    pagingResult, activePage, setActivePage, forceHideMenuItems, onPagesDeleted, onPagePutBacked,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { injectTo } = useSWRxPageInfoForList(pageIds, null, true, true);

  let pageWithMetas: IDataWithMeta<IPageHasId, IPageInfoForOperation>[] = [];

  // for mutation
  const { advance: advancePt } = usePageTreeTermManager();
  const { advance: advanceDpl } = useDescendantsPageListForCurrentPathTermManager();

  // initial data
  if (pagingResult != null) {
    // convert without meta at first
    const dataWithMetas = pagingResult.items.map(page => convertToIDataWithMeta(page));
    // inject data for listing
    pageWithMetas = injectTo(dataWithMetas);
  }

  const pageDeletedHandler: OnDeletedFunction = useCallback((...args) => {
    const path = args[0];
    const isCompletely = args[2];
    if (path == null || isCompletely == null) {
      toastSuccess(t('deleted_page'));
    }
    else {
      toastSuccess(t('deleted_pages_completely', { path }));
    }

    advancePt();

    if (onPagesDeleted != null) {
      onPagesDeleted(...args);
    }
  }, [advancePt, onPagesDeleted, t]);

  const pagePutBackedHandler: OnPutBackedFunction = useCallback((path) => {
    toastSuccess(t('page_has_been_reverted', { path }));

    advancePt();
    advanceDpl();

    if (onPagePutBacked != null) {
      onPagePutBacked(path);
    }
  }, [advanceDpl, advancePt, onPagePutBacked, t]);

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
  }

  if (pagingResult == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const showPager = pagingResult.totalCount > pagingResult.limit;

  return (
    <>
      <PageList
        pages={pageWithMetas}
        isEnableActions={!isGuestUser}
        forceHideMenuItems={forceHideMenuItems}
        onPagesDeleted={pageDeletedHandler}
        onPagePutBacked={pagePutBackedHandler}
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

export type DescendantsPageListProps = {
  path: string,
}

export const DescendantsPageList = (props: DescendantsPageListProps): JSX.Element => {
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
      onPagePutBacked={() => mutate()}
    />
  );
};

export const DescendantsPageListForCurrentPath = (): JSX.Element => {

  const [activePage, setActivePage] = useState(1);

  const { data: isTrashPage } = useIsTrashPage();
  const { data: limit } = useShowPageLimitationXL();
  const { data: pagingResult, error, mutate } = useSWRxDescendantsPageListForCurrrentPath(activePage, limit);

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error.message}</div>
      </div>
    );
  }

  const forceHideMenuItems = isTrashPage ? [MenuItemType.RENAME] : undefined;

  return (
    <DescendantsPageListSubstance
      pagingResult={pagingResult}
      activePage={activePage}
      setActivePage={setActivePage}
      forceHideMenuItems={forceHideMenuItems}
      onPagesDeleted={() => mutate()}
    />
  );

};
