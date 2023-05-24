import React from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IPageHasId } from '~/interfaces/page';
import { useCurrentPagePath } from '~/stores/page';
import { useTimelineOptions } from '~/stores/renderer';

import InfiniteScroll from './InfiniteScroll';
import { RevisionLoader } from './Page/RevisionLoader';

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

type PageTimelineResult = {
  pages: IPageHasId[],
  totalCount: number,
  offset: number,
}
const useSWRINFxPageTimeline = (path: string | undefined, limit: number) : SWRInfiniteResponse<PageTimelineResult, Error> => {
  return useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData != null && previousPageData.pages.length === 0) return null;
      if (path === undefined) return null;

      return ['/pages/list', path, pageIndex + 1, limit];
    },
    ([endpoint, path, page, limit]) => apiv3Get<PageTimelineResult>(endpoint, { path, page, limit }).then(response => response.data),
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    },
  );
};


export const PageTimeline = (): JSX.Element => {

  const PER_PAGE = 3;
  const { t } = useTranslation();
  const { data: currentPagePath } = useCurrentPagePath();

  const swrInfinitexPageTimeline = useSWRINFxPageTimeline(currentPagePath, PER_PAGE);
  const { data } = swrInfinitexPageTimeline;

  const isEmpty = data?.[0]?.pages.length === 0;
  const isReachingEnd = isEmpty || (data != null && data[data.length - 1]?.pages.length < PER_PAGE);

  if (data == null || isEmpty) {
    return (
      <div className="mt-2">
        {/* eslint-disable-next-line react/no-danger */}
        <p>{t('custom_navigation.no_page_list')}</p>
      </div>
    );
  }

  return (
    <div>
      <InfiniteScroll
        swrInifiniteResponse={swrInfinitexPageTimeline}
        isReachingEnd={isReachingEnd}
      >
        { data != null && data.flatMap(apiResult => apiResult.pages)
          .map(page => (
            <TimelineCard key={page._id} page={page} />
          ))
        }
      </InfiniteScroll>
    </div>
  );
};
