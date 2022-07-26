import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IPageHasId } from '~/interfaces/page';
import { useCurrentPagePath } from '~/stores/context';
import { useTimelineOptions } from '~/stores/renderer';

import RevisionLoader from './Page/RevisionLoader';
import PaginationWrapper from './PaginationWrapper';


const PageTimeline = (): JSX.Element => {
  const { t } = useTranslation();

  const [activePage, setActivePage] = useState(1);
  const [totalPageItems, setTotalPageItems] = useState(0);
  const [limit, setLimit] = useState();
  const [pages, setPages] = useState<IPageHasId[] | null>(null);

  const { data: currentPagepath } = useCurrentPagePath();
  const { data: rendererOptions } = useTimelineOptions();

  const handlePage = useCallback(async(selectedPageNum: number) => {
    const res = await apiv3Get('/pages/list', { currentPagepath, selectedPageNum });
    setTotalPageItems(res.data.totalCount);
    setPages(res.data.pages);
    setLimit(res.data.limit);
    setActivePage(selectedPageNum);
  }, [currentPagepath]);

  useEffect(() => {
    handlePage(1);
  }, [handlePage]);

  if (rendererOptions == null) {
    return <></>;
  }

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
      { pages.map((page) => {
        return (
          <div className="timeline-body" key={`key-${page._id}`}>
            <div className="card card-timeline">
              <div className="card-header"><a href={page.path}>{page.path}</a></div>
              <div className="card-body">
                <RevisionLoader
                  lazy
                  rendererOptions={rendererOptions}
                  pageId={page._id}
                  pagePath={page.path}
                  revisionId={page.revision}
                />
              </div>
            </div>
          </div>
        );
      }) }
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

export default PageTimeline;
