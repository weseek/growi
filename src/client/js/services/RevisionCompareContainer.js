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
    };

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
    await this.fetchAllPageRevisions();

    const latestRevisionId = this.state.revisions[0]._id;
    const { compareRevisionIds } = this.pageContainer.state;
    const fromRevisionIdParam = compareRevisionIds[0] || latestRevisionId;
    const toRevisionIdParam = compareRevisionIds[1] || latestRevisionId;
    await this.handleFromRevisionChange(fromRevisionIdParam);
    await this.handleToRevisionChange(toRevisionIdParam);
  }

  /**
   * Fetch page revision body by revision_id in argument
   * @param {string} revisionId
   */
  async fetchPageRevisionBody(revisionId) {
    const { pageId, shareLinkId } = this.pageContainer.state;
    try {
      const res = await this.appContainer.apiv3Get(`/revisions/${revisionId}`, { pageId, shareLinkId });
      if (res == null || res.data === undefined || res.data.revision === undefined) {
        logger.warn(`cannot get revision. revisionId: ${revisionId}`);
        return null;
      }
      return res.data.revision.body;
    }
    catch (err) {
      toastError(err);
      this.setState({ errorMessage: err.message });
      logger.error(err);
    }
  }

  /**
   * Fetch all page revisions
   *
   * Each revision to be saved contains only "_id" and "createdAt", and "body" is initialized to null.
   * ex. [{_id: "5ff03fded799ebc858a09266", body: null, creat…}, {_id: "5ff03fbed799ebc858a09262", body: null, creat…}]
   */
  async fetchAllPageRevisions() {
    const { pageId, shareLinkId } = this.pageContainer.state;

    // fetch all page revisions that are sorted update day time descending
    let max = 1000; // Maximum number of loops to avoid infinite loops.
    let newRevisions = [];
    let page = 1;
    let res = null;
    /* eslint-disable no-await-in-loop */
    do {
      res = await this.appContainer.apiv3Get('/revisions/list', {
        pageId, shareLinkId, page,
      });
      newRevisions = newRevisions.concat(res.data.docs.map((rev) => {
        const { _id, createdAt, path } = rev;
        return {
          _id, createdAt, path, body: null,
        };
      }));
      page++;
    } while (res.data.hasNextPage && --max > 0);
    /* eslint-disable no-await-in-loop */

    this.setState({ revisions: newRevisions });
  }

  /**
   * Fetch specified page revision
   * If revision's body is empty, it will be completed.
   * @param {string} revisionId
   * @return {revision} revision
   */
  async fetchPageRevision(revisionId) {
    try {
      const compactRevision = this.state.revisions.find(rev => rev._id === revisionId);
      if (this.state.revisions.find(rev => rev._id === revisionId) === undefined) {
        return null;
      }
      if (compactRevision.body == null) {
        const body = await this.fetchPageRevisionBody(revisionId);
        compactRevision.body = body;

        // cache revision body
        const newRevisions = this.state.revisions.map((rev) => {
          if (rev._id === revisionId) {
            return { ...rev, body };
          }
          return rev;
        });
        this.setState({ revisions: newRevisions });
      }
      return compactRevision;
    }
    catch (err) {
      toastError(err);
      this.setState({ errorMessage: err.message });
      logger.error(err);
    }
  }

  async handleFromRevisionChange(revision) {
    this.setState({ fromRevision: revision });
  }

  async handleToRevisionChange(revision) {
    this.setState({ toRevision: revision });
  }

  get compareRevisionIds() {
    const searchParams = {};
    for (const param of window.location.search?.substr(1)?.split('&')) {
      const [k,v] = param.split('=');
      searchParams[k] = v;
    }
    if (!searchParams['compare']) {
      return [];
    }

    return searchParams['compare'].split('...') || [];
  }

}
