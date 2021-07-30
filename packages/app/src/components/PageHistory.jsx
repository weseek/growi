import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastError } from '~/client/util/apiNotification';

import { withLoadingSppiner } from './SuspenseUtils';
import PageRevisionTable from './PageHistory/PageRevisionTable';

import PageHistroyContainer from '~/client/services/PageHistoryContainer';
import PaginationWrapper from './PaginationWrapper';
import RevisionComparer from './RevisionComparer/RevisionComparer';
import RevisionComparerContainer from '~/client/services/RevisionComparerContainer';

const logger = loggerFactory('growi:PageHistory');

function PageHistory(props) {
  const { pageHistoryContainer, revisionComparerContainer } = props;
  const { getPreviousRevision } = pageHistoryContainer;
  const {
    activePage, totalPages, pagingLimit, revisions, diffOpened,
  } = pageHistoryContainer.state;

  const handlePage = useCallback(async(selectedPage) => {
    try {
      await props.pageHistoryContainer.retrieveRevisions(selectedPage);
    }
    catch (err) {
      toastError(err);
      props.pageHistoryContainer.setState({ errorMessage: err.message });
      logger.error(err);
    }
  }, [props.pageHistoryContainer]);

  if (pageHistoryContainer.state.errorMessage != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{pageHistoryContainer.state.errorMessage}</div>
      </div>
    );
  }

  if (pageHistoryContainer.state.revisions === pageHistoryContainer.dummyRevisions) {
    throw new Promise(async() => {
      try {
        await props.pageHistoryContainer.retrieveRevisions(1);
        await props.revisionComparerContainer.initRevisions();
      }
      catch (err) {
        toastError(err);
        pageHistoryContainer.setState({ errorMessage: err.message });
        logger.error(err);
      }
    });
  }

  function pager() {
    return (
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalPages}
        pagingLimit={pagingLimit}
        align="center"
      />
    );
  }

  return (
    <div className="revision-history">
      <PageRevisionTable
        pageHistoryContainer={pageHistoryContainer}
        revisionComparerContainer={revisionComparerContainer}
        revisions={revisions}
        diffOpened={diffOpened}
        getPreviousRevision={getPreviousRevision}
      />
      <div className="my-3">
        {pager()}
      </div>
      <RevisionComparer />
    </div>
  );

}

const RenderPageHistoryWrapper = withUnstatedContainers(withLoadingSppiner(PageHistory), [PageHistroyContainer, RevisionComparerContainer]);

PageHistory.propTypes = {
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
  revisionComparerContainer: PropTypes.instanceOf(RevisionComparerContainer).isRequired,
};

export default RenderPageHistoryWrapper;
