import React, {
  useEffect, useCallback, useState, VFC,
} from 'react';

import { PaginationWrapper } from '~/components/PaginationWrapper';
import Page from '~/client/js/components/PageList/Page';
import RevisionLoader from '~/client/js/components/Page/RevisionLoader';

import { Page as IPage } from '~/interfaces/page';

import { useSearchResultRenderer } from '~/stores/renderer';
import { useCurrentPageList } from '~/stores/page';
import { useTranslation } from '~/i18n';

type Props = {
  isTimeLine?: boolean,
}

export const PageList:VFC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const { data: renderer } = useSearchResultRenderer();
  const { isTimeLine = false } = props;

  const [pages, setPages] = useState<IPage[]>([]);

  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [limit, setLimit] = useState(Infinity);

  const { data: paginationResult } = useCurrentPageList(activePage);

  const handlePage = useCallback(async(selectedPage) => {
    setActivePage(selectedPage);
  }, []);

  useEffect(() => {
    if (paginationResult == null) {
      return;
    }
    setTotalItemsCount(paginationResult.totalCount);
    setLimit(paginationResult.limit);
    setPages(paginationResult.pages);
  }, [paginationResult]);

  if (paginationResult == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="mt-2">
        <p>{t('custom_navigation.no_page_list')}</p>
      </div>
    );
  }

  return (
    <div className="page-list">
      {isTimeLine ? (
        <>
          {pages.map((page) => {
            return (
              <div className="timeline-body" key={`key-${page._id}`}>
                <div className="card card-timeline">
                  <div className="card-header"><a href={page.path}>{page.path}</a></div>
                  <div className="card-body">
                    <RevisionLoader
                      lazy
                      renderer={renderer}
                      pageId={page._id}
                      revisionId={page.revision}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <ul className="page-list-ul page-list-ul-flat">
          {pages.map(page => (
            <li key={page._id} className="mb-3">
              <Page page={page} />
            </li>
          ))}
        </ul>
      )}
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalItemsCount}
        pagingLimit={limit}
        align="center"
      />
    </div>
  );

};
