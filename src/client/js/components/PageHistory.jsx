import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastError } from '../util/apiNotification';

import { withLoadingSppiner } from './SuspenseUtils';
import PageRevisionList from './PageHistory/PageRevisionList';

import PageHistroyContainer from '../services/PageHistoryContainer';
import PaginationWrapper from './PaginationWrapper';

const logger = loggerFactory('growi:PageHistory');


function PageHistory(props) {
  const { pageHistoryContainer } = props;

  if (pageHistoryContainer.state.revisions === pageHistoryContainer.dummyRevisions) {
    throw new Promise(async() => {
      try {
        await props.pageHistoryContainer.retrieveRevisions(1);
      }
      catch (err) {
        toastError(err);
        pageHistoryContainer.setState({ errorMessage: err.message });
        logger.error(err);
      }
    });
  }

  async function handlePage(selectedPage) {
    try {
      await props.pageHistoryContainer.retrieveRevisions(selectedPage);
    }
    catch (err) {
      toastError(err);
      pageHistoryContainer.setState({ errorMessage: err.message });
      logger.error(err);
    }
  }


  function pager() {
    return (
      <div className="pull-right my-3">
        <PaginationWrapper
          activePage={pageHistoryContainer.state.activePage}
          changePage={handlePage}
          totalItemsCount={pageHistoryContainer.state.totalRevisions}
          pagingLimit={pageHistoryContainer.state.pagingLimit}
        />
      </div>
    );
  }


  return (
    <div className="mt-4">
      {pageHistoryContainer.state.errorMessage && (
      <div className="my-5">
        <div className="text-danger">{pageHistoryContainer.state.errorMessage}</div>
      </div>
        ) }

      {pager()}
      <PageRevisionList
        revisions={pageHistoryContainer.state.revisions}
        diffOpened={pageHistoryContainer.state.diffOpened}
        getPreviousRevision={pageHistoryContainer.getPreviousRevision}
        onDiffOpenClicked={pageHistoryContainer.onDiffOpenClicked}
      />
      {pager()}

    </div>
  );

}

const RenderPageHistoryWrapper = withUnstatedContainers(withLoadingSppiner(PageHistory), [PageHistroyContainer]);

PageHistory.propTypes = {
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
};

export default RenderPageHistoryWrapper;
