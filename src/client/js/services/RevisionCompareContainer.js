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
    };

    this.fetchPageRevisionBody = this.fetchPageRevisionBody.bind(this);
    this.handleFromRevisionChange = this.handleFromRevisionChange.bind(this);
    this.handleToRevisionChange = this.handleToRevisionChange.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'RevisionCompareContainer';
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
