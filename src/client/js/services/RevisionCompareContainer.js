import { Container } from 'unstated';
import loggerFactory from '@alias/logger';

import { toastError } from '../util/apiNotification';

const logger = loggerFactory('growi:PageHistoryContainer');

/**
 * Service container for personal settings page (RevisionCompare.jsx)
 * @extends {Container} unstated Container
 */
export default class RevisionCompareContainer extends Container {

  constructor(appContainer, pageContainer) {
    super();

    this.appContainer = appContainer;
    this.pageContainer = pageContainer;

    this.state = {
      errMessage: null,

      fromRevision: null,
      toRevision: null,

      recentRevisions: [],
    }

    this.readyRevisions = this.readyRevisions.bind(this);
    this.fetchPageRevisionBody = this.fetchPageRevisionBody.bind(this);
    this.fetchPageRevisions = this.fetchPageRevisions.bind(this);
    this.fetchPageRevisionIfExists = this.fetchPageRevisionIfExists.bind(this);
    this.handleFromRevisionChange = this.handleFromRevisionChange.bind(this);
    this.handleToRevisionChange = this.handleToRevisionChange.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'RevisionCompareContainer';
  }

  async readyRevisions() {
    const [fromRevisionIdParam, toRevisionIdParam] = this.pageContainer.state.compareRevisionIds || [];

    await this.fetchPageRevisions();
    if (fromRevisionIdParam) {
      await this.fetchPageRevisionIfExists(fromRevisionIdParam);
    }
    if (toRevisionIdParam) {
      await this.fetchPageRevisionIfExists(toRevisionIdParam);
    }

    const fromRevision = this.state.recentRevisions.find(rev => rev._id === fromRevisionIdParam);
    const toRevision = this.state.recentRevisions.find(rev => rev._id === toRevisionIdParam);
    this.setState({ fromRevision, toRevision });
  }

  /**
   * fetch page revision body by revision_id in argument
   * @param {string} revisionId
   */
  async fetchPageRevisionBody(revisionId) {
    const { pageId, shareLinkId } = this.pageContainer.state;
    try {
      const res = await this.appContainer.apiv3Get(`/revisions/${revisionId}`, { pageId, shareLinkId });
      if (!res || !res.data || !res.data.revision) {
        console.log(`cannot get revision: ${res}`);
        return null;
      }
      return res.data.revision;
    }
    catch (err) {
      toastError(err);
      this.setState({ errorMessage: err.message });
      logger.error(err);
    }
  }

  async fetchPageRevisions() {
    const { pageId, shareLinkId } = this.pageContainer.state;
    const page = 1; // The pagination start number is fixed to 1.
    const res = await this.appContainer.apiv3Get('/revisions/list', {
      pageId, shareLinkId, page, limit: 2, // [TODO] Set limit
    });
    const recentRevisions = res.data.docs;
    this.setState({ recentRevisions });
  }

  async fetchPageRevisionIfExists(revisionId) {
    try {
      const revision = await this.fetchPageRevisionBody(revisionId);
      if (!revision || this.state.recentRevisions.map(rev => rev._id).includes(revision._id)) {
        return null;
      }

      const newRecentRevisions = this.state.recentRevisions;
      newRecentRevisions.push(revision);
      newRecentRevisions.sort((a, b) => {
        if (a._id < b._id) { return -1; }
        if (a._id > b._id) { return 1; }
        return 0;
      });
      this.setState({ recentRevisions: newRecentRevisions });
      return revision;
    }
    catch (err) {
      // If the RevisionId being entered is not correct, no special action will be taken.
      // [TODO] ignore default error handling of apiv3ErrorHandler
      if (err.length === 1 && err[0].code === 'validation_failed') {
        return;
      }
      toastError(err);
      this.setState({ errorMessage: err.message });
      logger.error(err);
    }
  }

  async handleFromRevisionChange(revisionId) {
    const fromRevision = await this.fetchPageRevisionBody(revisionId);
    this.setState({ fromRevision })
  }

  async handleToRevisionChange(revisionId) {
    const toRevision = await this.fetchPageRevisionBody(revisionId);
    this.setState({ toRevision })
  }

}
