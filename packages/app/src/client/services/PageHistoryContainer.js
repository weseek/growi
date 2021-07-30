import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

import { toastError } from '../util/apiNotification';

const logger = loggerFactory('growi:PageHistoryContainer');

/**
 * Service container for personal settings page (PageHistory.jsx)
 * @extends {Container} unstated Container
 */
export default class PageHistoryContainer extends Container {

  constructor(appContainer, pageContainer) {
    super();

    this.appContainer = appContainer;
    this.pageContainer = pageContainer;
    this.dummyRevisions = 0;

    this.state = {
      errorMessage: null,

      // set dummy rivisions for using suspense
      revisions: this.dummyRevisions,
      latestRevision: this.dummyRevisions,
      oldestRevision: this.dummyRevisions,
      diffOpened: {},

      totalPages: 0,
      activePage: 1,
      pagingLimit: 10,
    };

    this.retrieveRevisions = this.retrieveRevisions.bind(this);
    this.getPreviousRevision = this.getPreviousRevision.bind(this);
    this.fetchPageRevisionBody = this.fetchPageRevisionBody.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PageHistoryContainer';
  }

  /**
   * syncRevisions of selectedPage
   * @param {number} selectedPage
   */
  async retrieveRevisions(selectedPage) {
    const { pageId, shareLinkId } = this.pageContainer.state;
    const { pagingLimit } = this.state;
    const page = selectedPage;
    const pagingLimitForApiParam = pagingLimit + 1;

    if (!pageId) {
      return;
    }

    // Get one more for the bottom display
    const res = await this.appContainer.apiv3Get('/revisions/list', {
      pageId, shareLinkId, page, limit: pagingLimitForApiParam,
    });
    const rev = res.data.docs;
    // set Pagination state
    this.setState({
      activePage: selectedPage,
      totalPages: res.data.totalDocs,
      pagingLimit,
    });

    const diffOpened = {};

    let lastId = rev.length - 1;

    // If the number of rev count is the same, the last rev is for diff display, so exclude it.
    if (rev.length > pagingLimit) {
      lastId = rev.length - 2;
    }

    res.data.docs.forEach((revision, i) => {
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

    this.setState({ revisions: rev });
    this.setState({ diffOpened });

    if (selectedPage === 1) {
      this.setState({ latestRevision: rev[0] });
    }

    if (selectedPage === res.data.totalPages) {
      this.setState({ oldestRevision: rev[lastId] });
    }

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

    return;
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

  /**
   * fetch page revision body by revision in argument
   * @param {object} revision
   */
  async fetchPageRevisionBody(revision) {
    const { pageId, shareLinkId } = this.pageContainer.state;

    if (revision.body) {
      return;
    }

    try {
      const res = await this.appContainer.apiv3Get(`/revisions/${revision._id}`, { pageId, shareLinkId });
      this.setState({
        revisions: this.state.revisions.map((rev) => {
          // comparing ObjectId
          // eslint-disable-next-line eqeqeq
          if (rev._id == res.data.revision._id) {
            return res.data.revision;
          }

          return rev;
        }),
      });
    }
    catch (err) {
      toastError(err);
      this.setState({ errorMessage: err.message });
      logger.error(err);
    }
  }


}
