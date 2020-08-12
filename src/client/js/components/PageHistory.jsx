import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastError } from '../util/apiNotification';

import PageRevisionList from './PageHistory/PageRevisionList';

import PageHistroyContainer from '../services/PageHistoryContainer';

const logger = loggerFactory('growi:PageHistory');

// set dummy value tile for using suspense
let isLoaded = false;

function AppSettingsPage(props) {
  return (
    <Suspense
      fallback={(
        <div className="my-5 text-center">
          <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <RenderPageHistoryWrapper props={props} />
    </Suspense>
  );
}
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

const RenderPageHistoryWrapper = withUnstatedContainers(PageHistory, [PageHistroyContainer]);

PageHistory.propTypes = {
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
};

export default AppSettingsPage;
