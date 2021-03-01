import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

import { toastError } from '../util/apiNotification';

const logger = loggerFactory('growi:PageHistoryContainer');

/**
 * Service container for personal settings page (RevisionCompare.jsx)
 * @extends {Container} unstated Container
 */
export default class RevisionComparerContainer extends Container {

  constructor(appContainer, pageContainer) {
    super();

    this.appContainer = appContainer;
    this.pageContainer = pageContainer;

    this.state = {
      errMessage: null,

      sourceRevision: null,
      targetRevision: null,
      latestRevision: null,
    };

    this.initRevisions = this.initRevisions.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'RevisionComparerContainer';
  }

  /**
   * Initialize the revisions
   */
  async initRevisions() {
    const latestRevision = await this.fetchLatestRevision();

    const [sourceRevisionId, targetRevisionId] = this.getRevisionIDsToCompareAsParam();
    const sourceRevision = sourceRevisionId ? await this.fetchRevision(sourceRevisionId) : latestRevision;
    const targetRevision = targetRevisionId ? await this.fetchRevision(targetRevisionId) : latestRevision;
    const compareWithLatest = targetRevisionId ? false : this.state.compareWithLatest;

    this.setState({
      sourceRevision, targetRevision, latestRevision, compareWithLatest,
    });
  }

  /**
   * Get the IDs of the comparison source and target from "window.location" as an array
   */
  getRevisionIDsToCompareAsParam() {
    const searchParams = {};
    for (const param of window.location.search?.substr(1)?.split('&')) {
      const [k, v] = param.split('=');
      searchParams[k] = v;
    }
    if (!searchParams.compare) {
      return [];
    }

    return searchParams.compare.split('...') || [];
  }

  /**
   * Fetch the latest revision
   */
  async fetchLatestRevision() {
    const { pageId, shareLinkId } = this.pageContainer.state;

    try {
      const res = await this.appContainer.apiv3Get('/revisions/list', {
        pageId, shareLinkId, page: 1, limit: 1,
      });
      return res.data.docs[0];
    }
    catch (err) {
      toastError(err);
      this.setState({ errorMessage: err.message });
      logger.error(err);
    }
    return null;
  }

  /**
   * Fetch the revision of the specified ID
   * @param {string} revision ID
   */
  async fetchRevision(revisionId) {
    const { pageId, shareLinkId } = this.pageContainer.state;

    try {
      const res = await this.appContainer.apiv3Get(`/revisions/${revisionId}`, {
        pageId, shareLinkId,
      });
      return res.data.revision;
    }
    catch (err) {
      toastError(err);
      this.setState({ errorMessage: err.message });
      logger.error(err);
    }
    return null;
  }

}
