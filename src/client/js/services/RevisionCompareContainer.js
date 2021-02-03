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
      latestRevision: null,
      compareWithLatest: true,
    };

    this.initRevisions = this.initRevisions.bind(this);
    this.toggleCompareWithLatest = this.toggleCompareWithLatest.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'RevisionCompareContainer';
  }

  /**
   * Initialize the revisions
   */
  async initRevisions() {
    const latestRevision = await this.fetchLatestRevision();

    const [fromRevisionId, toRevisionId] = this.revisionIDsToCompareAsParam;
    const fromRevision = fromRevisionId ? await this.fetchRevision(fromRevisionId) : latestRevision;
    const toRevision = toRevisionId ? await this.fetchRevision(toRevisionId) : latestRevision;

    this.setState({ fromRevision, toRevision, latestRevision });
  }

  /**
   * Get the IDs of the comparison source and target from "window.location" as an array
   */
  get revisionIDsToCompareAsParam() {
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

  /**
   * toggle state "compareWithLatest", and if true, set "fromRevision" to the latest revision
   */
  toggleCompareWithLatest() {
    const { compareWithLatest } = this.state;
    const newCompareWithLatest = !compareWithLatest;

    this.setState(
      Object.assign(
        { compareWithLatest: newCompareWithLatest },
        (newCompareWithLatest === true ? { toRevision: this.state.latestRevision } : {})
      )
    );
  }
}
