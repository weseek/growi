import React, {
  useCallback, useState, FC, useEffect,
} from 'react';

import { useTranslation } from '~/i18n';
// import { PageRevisionList } from '~/components/PageAccessory/PageRevisionList';
import { PageRevisionTable } from '~/components/PageAccessory/PageRevisionTable';
import { PaginationWrapper } from '~/components/PaginationWrapper';
import { Revision } from '~/interfaces/page';

import { useCurrentPageHistorySWR } from '~/stores/page';

export const PageHistory:FC = () => {
  const { t } = useTranslation();

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [latestRevision, setLatestRevision] = useState<Revision>();
  const [diffOpened, setDiffOpened] = useState<{[key:string]:boolean}>({});

  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data: paginationResult, error } = useCurrentPageHistorySWR(activePage, limit);

  const handlePage = useCallback(async(selectedPage) => {
    setActivePage(selectedPage);
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

    if (activePage === 1) {
      setLatestRevision(revisions[0]);
    }

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
  }, [activePage, limit, paginationResult]);

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

  // TODO: activate with GW-5253
  // if (pageHistoryContainer.state.revisions === pageHistoryContainer.dummyRevisions) {
  //   throw new Promise(async() => {
  //     try {
  //       await props.pageHistoryContainer.retrieveRevisions(1);
  //       await props.revisionComparerContainer.initRevisions();
  //     }
  //     catch (err) {
  //       toastError(err);
  //       pageHistoryContainer.setState({ errorMessage: err.message });
  //       logger.error(err);
  //     }
  //   });
  // }

  return (
    <div className="revision-history">
      <h3 className="pb-3">{t('page_history.revision_list')}</h3>
      <PageRevisionTable
        revisions={revisions}
        pagingLimit={limit}
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
