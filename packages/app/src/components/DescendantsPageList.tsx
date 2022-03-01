import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastSuccess } from '~/client/util/apiNotification';
import {
  IDataWithMeta,
  IPageHasId,
  IPageInfoForOperation,
} from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useIsGuestUser, useIsSharedUser, useIsTrashPage } from '~/stores/context';

import { useSWRxDescendantsPageListForCurrrentPath, useSWRxPageInfoForList, useSWRxPageList } from '~/stores/page';
import { usePageTreeTermManager } from '~/stores/page-listing';
import { ForceHideMenuItems, MenuItemType } from './Common/Dropdown/PageItemControl';

import PageList from './PageList/PageList';
import PaginationWrapper from './PaginationWrapper';


type SubstanceProps = {
  pagingResult: IPagingResult<IPageHasId> | undefined,
  activePage: number,
  setActivePage: (activePage: number) => void,
  forceHideMenuItems?: ForceHideMenuItems,
  onPagesDeleted?: OnDeletedFunction,
}

const convertToIDataWithMeta = (page: IPageHasId): IDataWithMeta<IPageHasId> => {
  return { data: page };
};

export const DescendantsPageListSubstance = (props: SubstanceProps): JSX.Element => {

  const { t } = useTranslation();

  const {
    pagingResult, activePage, setActivePage, forceHideMenuItems, onPagesDeleted,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { injectTo } = useSWRxPageInfoForList(pageIds, true, true);

  let pageWithMetas: IDataWithMeta<IPageHasId, IPageInfoForOperation>[] = [];

  // for mutation
  const { advance: advancePt } = usePageTreeTermManager();

  // initial data
  if (pagingResult != null) {
    // convert without meta at first
    const dataWithMetas = pagingResult.items.map(page => convertToIDataWithMeta(page));
    // inject data for listing
    pageWithMetas = injectTo(dataWithMetas);
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

  if (pagingResult == null) {
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
        pages={pageWithMetas}
        isEnableActions={!isGuestUser}
        forceHideMenuItems={forceHideMenuItems}
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

  const { data: isTrashPage } = useIsTrashPage();
  const { data: pagingResult, error, mutate } = useSWRxDescendantsPageListForCurrrentPath(activePage);

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
