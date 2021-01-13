import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastError } from '../util/apiNotification';

import { withLoadingSppiner } from './SuspenseUtils';
import PageRevisionList from './PageHistory/PageRevisionList';

import PageHistroyContainer from '../services/PageHistoryContainer';
import PaginationWrapper from './PaginationWrapper';
import RevisionCompare from './RevisionCompare';
import RevisionCompareContainer from '../services/RevisionCompareContainer';

const logger = loggerFactory('growi:PageHistory');

function PageHistory(props) {
  const { pageHistoryContainer } = props;
  const { getPreviousRevision, onDiffOpenClicked } = pageHistoryContainer;
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
        await props.revisionCompareContainer.initRevisions();
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
    <div>
      <PageRevisionList
        pageHistoryContainer={pageHistoryContainer}
        revisions={revisions}
        diffOpened={diffOpened}
        getPreviousRevision={getPreviousRevision}
        onDiffOpenClicked={onDiffOpenClicked}
      />
      {pager()}

      <RevisionCompare />
    </div>
  );

}

const RenderPageHistoryWrapper = withUnstatedContainers(withLoadingSppiner(PageHistory), [PageHistroyContainer, RevisionCompareContainer]);

PageHistory.propTypes = {
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,
};

export default RenderPageHistoryWrapper;
