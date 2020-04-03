import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';

import PageRevisionList from './PageHistory/PageRevisionList';

const logger = loggerFactory('growi:PageHistory');
class PageHistory extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
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
    const pageId = this.props.pageId;

    if (!pageId) {
      return;
    }

    let res;
    try {
      this.setState({ isLoading: true });
      res = await this.props.crowi.apiGet('/revisions.ids', { page_id: pageId });
    }
    catch (err) {
      logger.error(err);
      this.setState({ errorMessage: err });
      return;
    }
    finally {
      this.setState({ isLoading: false });
    }

    const rev = res.revisions;
    const diffOpened = {};
    const lastId = rev.length - 1;
    res.revisions.forEach((revision, i) => {
      const user = this.props.crowi.findUserById(revision.author);
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
    if (revision.body) {
      return;
    }

    this.props.crowi.apiGet('/revisions.get',
      { page_id: this.props.pageId, revision_id: revision._id })
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

PageHistory.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pageId: PropTypes.string,
  crowi: PropTypes.object.isRequired,
};

export default withTranslation()(PageHistory);
