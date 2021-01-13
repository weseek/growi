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
    };

    this.initRevisions = this.initRevisions.bind(this);
    this.handleFromRevisionChange = this.handleFromRevisionChange.bind(this);
    this.handleToRevisionChange = this.handleToRevisionChange.bind(this);
    this.fetchLatestRevision = this.fetchLatestRevision.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'RevisionCompareContainer';
  }

  async initRevisions(revisions) {
    const fromRevision = revisions.find(it => it._id === this.compareRevisionIds[0]) || revisions[0];
    const toRevision = revisions.find(it => it._id === this.compareRevisionIds[1]) || revisions[0];
    const latestRevision = await this.fetchLatestRevision();

    this.setState({ fromRevision, toRevision, latestRevision });
  }

  handleFromRevisionChange(revision) {
    this.setState({ fromRevision: revision });
  }

  handleToRevisionChange(revision) {
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
  }
}
