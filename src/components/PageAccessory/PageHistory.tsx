import { useRouter } from 'next/router';
import React, {
  useCallback, useState, useEffect, VFC,
} from 'react';

import { useTranslation } from '~/i18n';

import { toastError } from '~/client/js/util/apiNotification';
import { apiv3Get } from '~/utils/apiv3-client';

import { PageRevisionTable } from '~/components/PageAccessory/PageRevisionTable';
import { PaginationWrapper } from '~/components/PaginationWrapper';
import { RevisionComparer } from '~/components/PageAccessory/RevisionComparer';

import { Revision } from '~/interfaces/page';

import { useCurrentPageSWR, useCurrentPageHistorySWR, useRevisionById } from '~/stores/page';
import { useShareLinkId } from '~/stores/context';

export const PageHistory: VFC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: currentPage } = useCurrentPageSWR();
  const { data: shareLinkId } = useShareLinkId();

  const [revisions, setRevisions] = useState<Revision[]>([]);

  const [sourceRevisionIdUrl, setSourceRevisionIdUrl] = useState<string>();
  const { data: sourceRevisionFoundByIdFromUrl } = useRevisionById(sourceRevisionIdUrl);

  const [sourceRevision, setSourceRevision] = useState<Revision>();
  const [targetRevision, setTargetRevision] = useState<Revision>();

  const [targetRevisionIdFromUrl, setTargetRevisionIdUrl] = useState<string>();
  const { data: targetRevisionFoundByIdFromUrl } = useRevisionById(targetRevisionIdFromUrl);
  useEffect(() => {
    if (sourceRevisionFoundByIdFromUrl != null) {
      setSourceRevision(sourceRevisionFoundByIdFromUrl);
    }
  }, [sourceRevisionFoundByIdFromUrl]);

  useEffect(() => {
    if (targetRevisionFoundByIdFromUrl != null) {
      setTargetRevision(targetRevisionFoundByIdFromUrl);
    }
  }, [targetRevisionFoundByIdFromUrl]);

  const [latestRevision, setLatestRevision] = useState<Revision>();

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

  /**
   * Fetch the latest revision
   */
  const fetchLatestRevision = useCallback(async() => {
    try {
      const res = await apiv3Get('/revisions/list', {
        pageId: currentPage?._id, shareLinkId, page: 1, limit: 1,
      });
      return res.data.docs[0];
    }
    catch (err) {
      toastError(err);
    }
    return null;
  }, [currentPage?._id, shareLinkId]);

  /**
   * Initialize the revisions
   */
  const initRevisions = useCallback(async() => {
    // TODO fetchLatestRevision
    // const latestRevision = await fetchLatestRevision();

    const [sourceRevisionId, targetRevisionId] = getRevisionIDsToCompareAsParam();

    if (sourceRevisionId != null) {
      setSourceRevisionIdUrl(sourceRevisionId);
    }

    if (targetRevisionId != null) {
      setTargetRevisionIdUrl(targetRevisionId);
    }
    // const sourceRevision = sourceRevisionId ? fetchRevision(sourceRevisionId) : latestRevision;
    // const targetRevision = targetRevisionId ? fetchRevision(targetRevisionId) : latestRevision;

    // setLatestRevision(latestRevision);
  }, [getRevisionIDsToCompareAsParam]);

  useEffect(() => {
    initRevisions();
  }, [initRevisions]);


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
      <h3 className="pb-3">{t('page_history.revision_list')}</h3>
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
