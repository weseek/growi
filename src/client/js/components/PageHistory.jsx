import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import PageRevisionList from './PageHistory/PageRevisionList';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

const logger = loggerFactory('growi:PageHistory');
class PageHistory extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // TODO use suspense
      isLoaded: false,
      isLoading: false,
      errorMessage: null,
      revisions: [],
      diffOpened: {},
    };

    this.getPreviousRevision = this.getPreviousRevision.bind(this);
    this.onDiffOpenClicked = this.onDiffOpenClicked.bind(this);
  }

  async componentWillMount() {
    const { appContainer, pageContainer } = this.props;
    const { shareLinkId, pageId } = pageContainer.state;

    if (!pageId) {
      return;
    }

    let res;
    try {
      this.setState({ isLoading: true });
      res = await appContainer.apiv3Get('/revisions/list', { pageId, share_link_id: shareLinkId });
    }
    catch (err) {
      logger.error(err);
      this.setState({ errorMessage: err });
      return;
    }
    finally {
      this.setState({ isLoading: false });
    }
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

    this.setState({
      isLoaded: true,
      revisions: rev,
      diffOpened,
    });

    // load 0, and last default
    if (rev[0]) {
      this.fetchPageRevisionBody(rev[0]);
    }
    if (rev[1]) {
      this.fetchPageRevisionBody(rev[1]);
    }
    if (lastId !== 0 && lastId !== 1 && rev[lastId]) {
      this.fetchPageRevisionBody(rev[lastId]);
    }
  }

  getPreviousRevision(currentRevision) {
    let cursor = null;
    for (const revision of this.state.revisions) {
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

  onDiffOpenClicked(revision) {
    const diffOpened = this.state.diffOpened;
    const revisionId = revision._id;

    diffOpened[revisionId] = !(diffOpened[revisionId]);
    this.setState({
      diffOpened,
    });

    this.fetchPageRevisionBody(revision);
    this.fetchPageRevisionBody(this.getPreviousRevision(revision));
  }

  fetchPageRevisionBody(revision) {
    const { appContainer, pageContainer } = this.props;
    const { shareLinkId, pageId } = pageContainer.state;

    if (revision.body) {
      return;
    }

    appContainer.apiGet('/revisions.get',
      { page_id: pageId, revision_id: revision._id, share_link_id: shareLinkId })
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

  render() {
    return (
      <div className="mt-4">
        { this.state.isLoading && (
          <div className="my-5 text-center">
            <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted"></i>
          </div>
        ) }
        { this.state.errorMessage && (
          <div className="my-5">
            <div className="text-danger">{this.state.errorMessage}</div>
          </div>
        ) }
        { this.state.isLoaded && (
          <PageRevisionList
            t={this.props.t}
            revisions={this.state.revisions}
            diffOpened={this.state.diffOpened}
            getPreviousRevision={this.getPreviousRevision}
            onDiffOpenClicked={this.onDiffOpenClicked}
          />
        ) }
      </div>
    );
  }

}

const PageHistoryWrapper = withUnstatedContainers(PageHistory, [AppContainer, PageContainer]);


PageHistory.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  t: PropTypes.func.isRequired, // i18next

};

export default withTranslation()(PageHistoryWrapper);
