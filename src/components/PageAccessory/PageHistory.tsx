import { useRouter } from 'next/router';
import React, {
  useCallback, useState, useEffect, VFC,
} from 'react';

import { useTranslation } from '~/i18n';

import { PageRevisionTable } from '~/components/PageAccessory/PageRevisionTable';
import { PaginationWrapper } from '~/components/PaginationWrapper';
import { RevisionComparer } from '~/components/PageAccessory/RevisionComparer';

import { Revision } from '~/interfaces/page';

import {
  useCurrentPageSWR, useCurrentPageHistorySWR, useRevisionById, useLatestRevision,
} from '~/stores/page';

export const PageHistory: VFC = () => {
  const router = useRouter();

  const { data: currentPage } = useCurrentPageSWR();

  const [revisions, setRevisions] = useState<Revision[]>([]);

  const [sourceRevision, setSourceRevision] = useState<Revision>();
  const [targetRevision, setTargetRevision] = useState<Revision>();

  /**
   * Get the IDs of the comparison source and target from "next/route" as an array
   */
  const getRevisionIDsToCompareAsParam = useCallback((): Array<string> => {
    const { compare } = router.query;
    if (compare == null || Array.isArray(compare)) {
      return [];
    }

    return compare.split('...') || [];
  }, [router.query]);

  const [sourceRevisionIdFromUrl, targetRevisionIdFromUrl] = getRevisionIDsToCompareAsParam();
  const { data: sourceRevisionFoundByIdFromUrl } = useRevisionById(sourceRevisionIdFromUrl);
  const { data: targetRevisionFoundByIdFromUrl } = useRevisionById(targetRevisionIdFromUrl);
  const { data: latestRevision } = useLatestRevision();

  // If revision can be retrieved by id from url, set to sourceRevision
  useEffect(() => {
    if (sourceRevisionFoundByIdFromUrl != null) {
      setSourceRevision(sourceRevisionFoundByIdFromUrl);
    }
  }, [sourceRevisionFoundByIdFromUrl]);
  // If revision can be retrieved by id from url, set to targetRevision
  useEffect(() => {
    if (targetRevisionFoundByIdFromUrl != null) {
      setTargetRevision(targetRevisionFoundByIdFromUrl);
    }
  }, [targetRevisionFoundByIdFromUrl]);
  // set latestRevision when revisionIds from url don`t exist.
  useEffect(() => {
    if (sourceRevisionIdFromUrl == null) {
      setSourceRevision(latestRevision);
    }
    if (targetRevisionIdFromUrl == null) {
      setTargetRevision(latestRevision);
    }
  }, [latestRevision, sourceRevisionIdFromUrl, targetRevisionIdFromUrl]);

  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data: paginationResult, error } = useCurrentPageHistorySWR(activePage, limit);

  const handlePage = useCallback(async(selectedPage) => {
    setActivePage(selectedPage);
  }, []);

  const compareLatestRevision = useCallback(async(revision) => {
    setSourceRevision(revision);
    setTargetRevision(latestRevision);
  }, [latestRevision]);

  const comparePreviousRevision = useCallback(async(revision, previousRevision) => {
    setSourceRevision(previousRevision);
    setTargetRevision(revision);
  }, []);

  useEffect(() => {
    if (paginationResult == null) {
      return;
    }
    setActivePage(paginationResult.page);
    setTotalItemsCount(paginationResult.totalDocs);
    setLimit(paginationResult.limit);

    const { docs: revisions } = paginationResult;
    setRevisions(revisions);
  }, [paginationResult]);


  if (paginationResult == null) {
    return (
      <div className="my-5 text-center">
        <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted" />
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="revision-history">
      <PageRevisionTable
        revisions={revisions}
        pagingLimit={limit}
        sourceRevision={sourceRevision}
        targetRevision={targetRevision}
        latestRevision={latestRevision}
        onClickCompareLatestRevisionButton={compareLatestRevision}
        onClickComparePreviousRevisionButton={comparePreviousRevision}
        onClickSourceRadio={revision => setSourceRevision(revision)}
        onClickTargetRadio={revision => setTargetRevision(revision)}
      />
      <div className="my-3">
        <PaginationWrapper
          activePage={activePage}
          changePage={handlePage}
          totalItemsCount={totalItemsCount}
          pagingLimit={limit}
          align="center"
        />
      </div>
      <RevisionComparer
        path={currentPage?.path}
        revisions={revisions}
        sourceRevision={sourceRevision}
        targetRevision={targetRevision}
      />
    </div>
  );
};
