import React, { useState, useEffect } from 'react';

import { IRevisionHasPageId } from '@growi/core';

import { useCurrentPageId } from '~/stores/context';
import { useSWRxPageRevisions } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { PageRevisionTable } from './PageHistory/PageRevisionTable';
import PaginationWrapper from './PaginationWrapper';
import { RevisionComparer } from './RevisionComparer/RevisionComparer';

const logger = loggerFactory('growi:PageHistory');

export const PageHistory = (): JSX.Element => {

  const [activePage, setActivePage] = useState(1);

  const { data: currentPageId } = useCurrentPageId();

  const { data: revisionsData } = useSWRxPageRevisions(activePage, 10, currentPageId);

  const [sourceRevision, setSourceRevision] = useState<IRevisionHasPageId>();
  const [targetRevision, setTargetRevision] = useState<IRevisionHasPageId>();

  useEffect(() => {
    if (revisionsData != null) {
      setSourceRevision(revisionsData.revisions[0]);
      setTargetRevision(revisionsData.revisions[0]);
    }
  }, [revisionsData]);

  const pagingLimit = 10;

  if (revisionsData == null || sourceRevision == null || targetRevision == null || currentPageId == null) {
    return (
      <div className="text-muted text-center">
        <i className="fa fa-2x fa-spinner fa-pulse mt-3"></i>
      </div>
    );
  }

  const pager = () => {
    return (
      <PaginationWrapper
        activePage={activePage}
        changePage={setActivePage}
        totalItemsCount={revisionsData.totalCounts}
        pagingLimit={pagingLimit}
        align="center"
      />
    );
  };

  return (
    <div className="revision-history" data-testid="page-history">
      <PageRevisionTable
        revisions={revisionsData.revisions}
        pagingLimit={pagingLimit}
        sourceRevision={sourceRevision}
        targetRevision={targetRevision}
        onChangeSourceInvoked={setSourceRevision}
        onChangeTargetInvoked={setTargetRevision}
      />
      <div className="my-3">
        {pager()}
      </div>
      <RevisionComparer
        sourceRevision={sourceRevision}
        targetRevision={targetRevision}
        currentPageId={currentPageId}
      />
    </div>
  );
};
