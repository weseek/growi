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

import { useCurrentPageSWR, useCurrentPageHistorySWR } from '~/stores/page';
import { useShareLinkId } from '~/stores/context';

export const PageHistory: VFC = () => {
  const { t } = useTranslation();
  const { data: currentPage } = useCurrentPageSWR();
  const { data: shareLinkId } = useShareLinkId();

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [sourceRevision, setSourceRevision] = useState<Revision>();
  const [targetRevision, setTargetRevision] = useState<Revision>();
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
   * Get the IDs of the comparison source and target from "window.location" as an array
   */
  const getRevisionIDsToCompareAsParam = (): Array<string> => {
    const searchParams:{ [key:string]: string} = {};
    for (const param of window.location.search?.substr(1)?.split('&')) {
      const [k, v] = param.split('=');
      searchParams[k] = v;
    }
    if (!searchParams.compare) {
      return [];
    }

    return searchParams.compare.split('...') || [];
  };

  /**
   * Fetch the revision of the specified ID
   * @param {string} revision ID
   */
  const fetchRevision = useCallback(async(revisionId) => {
    try {
      const res = await apiv3Get(`/revisions/${revisionId}`, {
        pageId: currentPage?._id, shareLinkId,
      });
      return res.data.revision;
    }
    catch (err) {
      toastError(err);
    }
    return null;
  }, [currentPage?._id, shareLinkId]);

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
    const latestRevision = await fetchLatestRevision();

    const [sourceRevisionId, targetRevisionId] = getRevisionIDsToCompareAsParam();
    const sourceRevision = sourceRevisionId ? fetchRevision(sourceRevisionId) : latestRevision;
    const targetRevision = targetRevisionId ? fetchRevision(targetRevisionId) : latestRevision;

    setLatestRevision(latestRevision);
    setSourceRevision(sourceRevision);
    setTargetRevision(targetRevision);
  }, [fetchLatestRevision, fetchRevision]);

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
