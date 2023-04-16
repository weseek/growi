import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IPageHasId } from '~/interfaces/page';
import { useCurrentPagePath } from '~/stores/page';
import { useTimelineOptions } from '~/stores/renderer';

import { RevisionLoader } from './Page/RevisionLoader';
import PaginationWrapper from './PaginationWrapper';

import styles from './PageTimeline.module.scss';


type TimelineCardProps = {
  page: IPageHasId,
}

const TimelineCard = ({ page }: TimelineCardProps): JSX.Element => {

  const { data: rendererOptions } = useTimelineOptions(page.path);

  return (
    <div className={`card card-timeline ${styles['card-timeline']}`}>
      <div className="card-header h4 p-3">
        <Link href={page.path} prefetch={false}>
          {page.path}
        </Link>
      </div>
      <div className="card-body">
        { rendererOptions != null && (
          <RevisionLoader
            rendererOptions={rendererOptions}
            pageId={page._id}
            revisionId={page.revision}
          />
        ) }
      </div>
    </div>
  );
};


export const PageTimeline = (): JSX.Element => {
  const [activePage, setActivePage] = useState(1);
  const [totalPageItems, setTotalPageItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState<IPageHasId[] | null>(null);

  const { data: currentPagePath } = useCurrentPagePath();
  const { t } = useTranslation();

  const handlePage = useCallback(async(selectedPage: number) => {
    if (currentPagePath == null) { return }
    const res = await apiv3Get('/pages/list', { path: currentPagePath, page: selectedPage });
    setTotalPageItems(res.data.totalCount);
    setPages(res.data.pages);
    setLimit(res.data.limit);
    setActivePage(selectedPage);
  }, [currentPagePath]);

  useEffect(() => {
    handlePage(1);
  }, [handlePage]);

  if (pages == null || pages.length === 0) {
    return (
      <div className="mt-2">
        {/* eslint-disable-next-line react/no-danger */}
        <p>{t('custom_navigation.no_page_list')}</p>
      </div>
    );
  }

  return (
    <div>
      { pages.map(page => <TimelineCard key={page._id} page={page} />) }
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalPageItems}
        pagingLimit={limit}
        align="center"
      />
    </div>
  );
};
