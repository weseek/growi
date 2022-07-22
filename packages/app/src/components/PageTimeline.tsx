import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useCurrentPagePath } from '~/stores/context';
import { useTimelineOptions } from '~/stores/renderer';

import RevisionLoader from './Page/RevisionLoader';
import PaginationWrapper from './PaginationWrapper';


const PageTimeline = (props) => {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState(1);
  const [totalPageItems, setTotalPageItems] = useState(0);
  const [limit, setLimit] = useState(null);
  const [pages, setPages] = useState(props.pages);

  const { data: path } = useCurrentPagePath();
  const { data: rendererOptions } = useTimelineOptions();

  const handlePage = async(selectedPage) => {
    const page = selectedPage;
    const res = await apiv3Get('/pages/list', { path, page });
    const totalPageItems = res.data.totalCount;
    const pages = res.data.pages;
    const pagingLimit = res.data.limit;

    setActivePage(selectedPage);
    setTotalPageItems(totalPageItems);
    setLimit(pagingLimit);
    setPages(pages);
  };

  useEffect(() => {
    handlePage(1);
    setActivePage(1);
  }, []);

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
