import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastError } from '../util/apiNotification';

import PageRevisionList from './PageHistory/PageRevisionList';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import PageHistroyContainer from '../services/PageHistoryContainer';

import fetchProfileData from './FakeApi';

const resource = fetchProfileData();

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
  const { pageContainer, pageHistoryContainer } = props;
  const { shareLinkId, pageId } = pageContainer.state;

  if (!isLoaded) {
    throw new Promise(async() => {
      try {
        await props.pageHistoryContainer.retrieveRevisions({ pageId, shareLinkId });
      }
      catch (err) {
        toastError(err);
        pageHistoryContainer.setState({ retrieveError: err.message });
        logger.error(err);
      }
      isLoaded = true;
    });
  }

  function fetchPageRevisionBody(revision) {
    const { appContainer, pageContainer } = props;
    const { pageId, shareLinkId } = pageContainer.state;

    if (revision.body) {
      return;
    }

    appContainer.apiGet('/revisions.get', { page_id: pageId, revision_id: revision._id, share_link_id: shareLinkId })
      .then((res) => {
        if (res.ok) {
          this.setState({
            revisions: this.state.revisions.map((rev) => {
              // comparing ObjectId
              // eslint-disable-next-line eqeqeq
              if (rev._id == res.revision._id) {
                return res.revision;
              }

              return rev;
            }),
          });
        }
      })
      .catch((err) => {

      });
  }

  // function getPreviousRevision(currentRevision) {
  //   let cursor = null;
  //   for (const revision of revisions) {
  //     // comparing ObjectId
  //     // eslint-disable-next-line eqeqeq
  //     if (cursor && cursor._id == currentRevision._id) {
  //       cursor = revision;
  //       break;
  //     }

  //     cursor = revision;
  //   }

  //   return cursor;
  // }

  // function onDiffOpenClicked(revision) {
  //   const revisionId = revision._id;

  //   diffOpened[revisionId] = !(diffOpened[revisionId]);
  //   setDiffOpened(diffOpened);

  //   fetchPageRevisionBody(revision);
  //   fetchPageRevisionBody(getPreviousRevision(revision));
  // }

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

const RenderPageHistoryWrapper = withUnstatedContainers(PageHistory, [AppContainer, PageContainer, PageHistroyContainer]);


PageHistory.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
};

export default AppSettingsPage;
