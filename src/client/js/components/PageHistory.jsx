import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';
import { toastError } from '../util/apiNotification';

import PageRevisionList from './PageHistory/PageRevisionList';
import AppContainer from '../services/AppContainer';


const logger = loggerFactory('growi:PageHistory');


function AppSettingsPage() {
  return (
    <Suspense
      fallback={(
        <div className="my-5 text-center">
          <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <PageHistoryWrapper2 />
    </Suspense>
  );
}
function PageHistory(props) {

  const [errorMessage, setErrorMessage] = useState(null);
  const [revisions, setRevisions] = useState(null);
  const [diffOpened, setDiffOpened] = useState(null);

  function fetchPageRevisionBody(revision) {
    const { appContainer } = props;
    const shareLinkId = props.shareLinkId || null;

    if (revision.body) {
      return;
    }

    appContainer.apiGet('/revisions.get', { page_id: props.pageId, revision_id: revision._id, share_link_id: shareLinkId })
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

  async function retrieveRevisions() {
    const { appContainer, pageId } = props;
    const shareLinkId = props.shareLinkId || null;

    if (!pageId) {
      return;
    }

    const res = await appContainer.apiv3Get('/revisions/list', { pageId, share_link_id: shareLinkId });
    const rev = res.data.revisions;
    const diffOpened = {};
    const lastId = rev.length - 1;

    res.data.revisions.forEach((revision, i) => {
      const user = revision.author;
      if (user) {
        rev[i].author = user;
      }

      if (i === 0 || i === lastId) {
        diffOpened[revision._id] = true;
      }
      else {
        diffOpened[revision._id] = false;
      }
    });

    setRevisions(rev);
    setDiffOpened(diffOpened);

    // load 0, and last default
    if (rev[0]) {
      fetchPageRevisionBody(rev[0]);
    }
    if (rev[1]) {
      fetchPageRevisionBody(rev[1]);
    }
    if (lastId !== 0 && lastId !== 1 && rev[lastId]) {
      fetchPageRevisionBody(rev[lastId]);
    }
  }

  function getPreviousRevision(currentRevision) {
    let cursor = null;
    for (const revision of revisions) {
      // comparing ObjectId
      // eslint-disable-next-line eqeqeq
      if (cursor && cursor._id == currentRevision._id) {
        cursor = revision;
        break;
      }

      cursor = revision;
    }

    return cursor;
  }

  function onDiffOpenClicked(revision) {
    const revisionId = revision._id;

    diffOpened[revisionId] = !(diffOpened[revisionId]);
    setDiffOpened(diffOpened);

    fetchPageRevisionBody(revision);
    fetchPageRevisionBody(getPreviousRevision(revision));
  }


  if (revisions == null) {
    throw new Promise(async() => {
      try {
        await retrieveRevisions();
      }
      catch (err) {
        toastError(err);
        logger.error(err);
        setErrorMessage(err);
      }
    });
  }

  return (
    <div className="mt-4">
      {errorMessage && (
      <div className="my-5">
        <div className="text-danger">{errorMessage}</div>
      </div>
        ) }
      <PageRevisionList
        t={props.t}
        revisions={revisions}
        diffOpened={diffOpened}
        getPreviousRevision={getPreviousRevision}
        onDiffOpenClicked={onDiffOpenClicked}
      />
    </div>
  );

}

const PageHistoryWrapper = withUnstatedContainers(PageHistory, [AppContainer]);


PageHistory.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  t: PropTypes.func.isRequired, // i18next

  shareLinkId: PropTypes.string,
  pageId: PropTypes.string,
};

const PageHistoryWrapper2 = withTranslation()(PageHistoryWrapper);

export default AppSettingsPage;
