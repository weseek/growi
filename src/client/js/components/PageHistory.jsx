import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastError } from '../util/apiNotification';

import { withLoadingSppiner } from './SuspenseUtils';
import PageRevisionList from './PageHistory/PageRevisionList';

import PageHistroyContainer from '../services/PageHistoryContainer';

const logger = loggerFactory('growi:PageHistory');

// for using suspense
let isLoaded = false;

function PageHistory(props) {
  const { pageHistoryContainer } = props;

  if (!isLoaded) {
    throw new Promise(async() => {
      try {
        await props.pageHistoryContainer.retrieveRevisions();
      }
      catch (err) {
        toastError(err);
        pageHistoryContainer.setState({ retrieveError: err.message });
        logger.error(err);
      }
      finally {
        isLoaded = true;
      }
    });
  }

  return (
    <div className="mt-4">
      {pageHistoryContainer.state.errorMessage && (
      <div className="my-5">
        <div className="text-danger">{pageHistoryContainer.state.errorMessage}</div>
      </div>
        ) }
      <PageRevisionList
        revisions={pageHistoryContainer.state.revisions}
        diffOpened={pageHistoryContainer.state.diffOpened}
        getPreviousRevision={pageHistoryContainer.getPreviousRevision}
        onDiffOpenClicked={pageHistoryContainer.onDiffOpenClicked}
      />
    </div>
  );

}

const RenderPageHistoryWrapper = withUnstatedContainers(withLoadingSppiner(PageHistory), [PageHistroyContainer]);

PageHistory.propTypes = {
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
};

export default RenderPageHistoryWrapper;
