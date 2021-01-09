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
   * fetch page revision body by revision_id in argument
   * @param {string} fromRevisionId
   * @param {string} toRevisionId
   */
  async fetchPageRevisionBody(fromRevisionId, toRevisionId) {
    const { pageId, shareLinkId } = this.pageContainer.state;
    try {
      const revsAll = [
        { id: fromRevisionId, key: "fromRevision" },
        { id: toRevisionId,   key: "toRevision" },
      ];
      const revs = revsAll.filter(it => it && it.id);
      for(let it of revs) {
        const res = await this.appContainer.apiv3Get(`/revisions/${it.id}`, { pageId, shareLinkId });
        const state = {}
        state[it.key] = res.data.revision;
        this.setState(state);
      }
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
      pageId, shareLinkId, page, limit: 100,
    });
    const recentRevisions = res.data.docs;

    res.data.docs.forEach((revision, i) => {
      const user = revision.author;
      if (user) {
        recentRevisions[i].author = user;
      }
    });

    this.setState({ recentRevisions });
  }

  handleFromRevisionChange(revisionId) {
    this.setState({
      fromRevision: revisionId
    })
    this.fetchPageRevisionBody(revisionId, this.state.toRevision._id);
  }

  handleToRevisionChange(revisionId) {
    this.setState({
      toRevision: revisionId
    })
    this.fetchPageRevisionBody(this.state.fromRevision._id, revisionId);
  }

}
