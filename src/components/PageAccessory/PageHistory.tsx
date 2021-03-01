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

type Props={
  revisionComparerContainer:RevisionComparerContainer;
}

const PageHistory:FC<Props> = (props:Props) => {
  const { revisionComparerContainer } = props;
  const { t } = useTranslation();

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [latestRevision, setLatestRevision] = useState<Revision>();

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

/**
 * Wrapper component for using unstated
 */
export const PageHistoryWrapper = withUnstatedContainers(PageHistory, [RevisionComparerContainer]);
