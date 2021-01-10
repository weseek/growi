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

      revisions: [],
    }

    this.readyRevisions = this.readyRevisions.bind(this);
    this.fetchPageRevisionBody = this.fetchPageRevisionBody.bind(this);
    this.fetchAllPageRevisions = this.fetchAllPageRevisions.bind(this);
    this.fetchPageRevision = this.fetchPageRevision.bind(this);
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

    await this.fetchAllPageRevisions();
    if (fromRevisionIdParam) {
      await this.handleFromRevisionChange(fromRevisionIdParam);
    }
    if (toRevisionIdParam) {
      await this.handleToRevisionChange(toRevisionIdParam);
    }
  }

  /**
   * fetch page revision body by revision_id in argument
   * @param {string} revisionId
   */
  async fetchPageRevisionBody(revisionId) {
    const { pageId, shareLinkId } = this.pageContainer.state;
    try {
      const res = await this.appContainer.apiv3Get(`/revisions/${revisionId}`, { pageId, shareLinkId });
      if (res == null || res.data == undefined || res.data.revision == undefined) {
        logger.warn(`cannot get revision. revisionId: ${revisionId}`);
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

  async fetchAllPageRevisions() {
    const { pageId, shareLinkId } = this.pageContainer.state;

    // fetch all page revisions that are sorted update day time descending
    let page = 1;
    let max = 1000; // Maximum number of loops to avoid infinite loops.
    let newRevisions = [];
    let res = null;
    do {
      res = await this.appContainer.apiv3Get('/revisions/list', {
        pageId, shareLinkId, page,
      });
      newRevisions = newRevisions.concat(res.data.docs.map(rev => {
        const { _id, createdAt } = rev;
        return { _id, createdAt, body: null };
      }));
    } while(res.hasNextPage && --max > 0);

    this.setState({ revisions: newRevisions });
  }

  async fetchPageRevision(revisionId) {
    try {
      const compactRevision = this.state.revisions.find(rev => rev._id === revisionId);
      if (this.state.revisions.find(rev => rev._id === revisionId) === undefined) {
        return null;
      }
      if (compactRevision.body == null) {
        const fullRevision = await this.fetchPageRevisionBody(revisionId);
        compactRevision.body = fullRevision.body;

        // cache revision body
        const newRevisions = this.state.revisions.map(rev => {
          if (rev._id === revisionId) {
            return { ...rev, body: fullRevision.body };
          }
          return rev;
        });
        this.setState( { revisions: newRevisions });
      }
      return compactRevision;
    }
    catch (err) {
      toastError(err);
      this.setState({ errorMessage: err.message });
      logger.error(err);
    }
  }

  async handleFromRevisionChange(revisionId) {
    const fromRevision = await this.fetchPageRevision(revisionId);
    this.setState({ fromRevision })
  }

  async handleToRevisionChange(revisionId) {
    const toRevision = await this.fetchPageRevision(revisionId);
    this.setState({ toRevision })
  }

}
