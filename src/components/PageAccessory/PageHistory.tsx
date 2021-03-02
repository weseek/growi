import React, {
  useCallback, useState, FC, useEffect,
} from 'react';

import { withUnstatedContainers } from '~/client/js/components/UnstatedUtils';
import { useTranslation } from '~/i18n';
// import { PageRevisionList } from '~/components/PageAccessory/PageRevisionList';
import { PageRevisionTable } from '~/components/PageAccessory/PageRevisionTable';
import { PaginationWrapper } from '~/components/PaginationWrapper';

import RevisionComparerContainer from '~/client/js/services/RevisionComparerContainer';
import { Revision } from '~/interfaces/page';

import { useCurrentPageHistorySWR } from '~/stores/page';

type Props = {
  revisionComparerContainer: RevisionComparerContainer;
}

const PageHistory:FC<Props> = (props:Props) => {
  const { revisionComparerContainer } = props;
  const { t } = useTranslation();

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [sourceRevision, setSourceRevision] = useState<Revision>();
  const [targetRevision, setTargetRevision] = useState<Revision>();
  const [latestRevision, setLatestRevision] = useState<Revision>();
  const [diffOpened, setDiffOpened] = useState<{[key:string]:boolean}>({});

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

    const diffOpened = {};

    const revisions = paginationResult.docs;
    let lastId = revisions.length - 1;

    // If the number of rev count is the same, the last rev is for diff display, so exclude it.
    if (revisions.length > limit) {
      lastId = revisions.length - 2;
    }

    revisions.forEach((revision, i) => {
      const user = revision.author;
      if (user) {
        revisions[i].author = user;
      }

      if (i === 0 || i === lastId) {
        diffOpened[revision._id] = true;
      }
      else {
        diffOpened[revision._id] = false;
      }
    });

    setRevisions(revisions);
    setDiffOpened(diffOpened);

    revisionComparerContainer.initRevisions();

    // load 0, and last default
    // if (rev[0]) {
    //   this.fetchPageRevisionBody(rev[0]);
    // }
    // if (rev[1]) {
    //   this.fetchPageRevisionBody(rev[1]);
    // }
    // if (lastId !== 0 && lastId !== 1 && rev[lastId]) {
    //   this.fetchPageRevisionBody(rev[lastId]);
    // }
  }, [activePage, limit, paginationResult, revisionComparerContainer]);


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
        revisionComparerContainer={revisionComparerContainer}
        revisions={revisions}
        pagingLimit={limit}
        diffOpened={diffOpened}
        sourceRevision={sourceRevision}
        targetRevision={targetRevision}
        latestRevision={latestRevision}
        onClickCompareLatestRevisionButton={compareLatestRevision}
        onClickComparePreviousRevisionButton={comparePreviousRevision}
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
      {/* <RevisionComparer /> */}
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
export const PageHistoryWrapper = withUnstatedContainers(PageHistory, [RevisionComparerContainer]);
