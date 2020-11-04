import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

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
      diffOpened: {},

      totalPages: 0,
      activePage: 1,
      pagingLimit: null,
    };

    this.retrieveRevisions = this.retrieveRevisions.bind(this);
    this.onDiffOpenClicked = this.onDiffOpenClicked.bind(this);
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
    const page = selectedPage;

    if (!pageId) {
      return;
    }

    const res = await this.appContainer.apiv3Get('/revisions/list', {
      pageId, shareLinkId, page,
    });
    const rev = res.data.docs;
    // set Pagination state
    this.setState({
      activePage: selectedPage,
      totalPages: res.data.totalDocs,
      pagingLimit: res.data.limit,
    });

    const diffOpened = {};
    const lastId = rev.length - 1;

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

  onDiffOpenClicked(revision) {
    const { diffOpened } = this.state;
    const revisionId = revision._id;

    diffOpened[revisionId] = !(diffOpened[revisionId]);
    this.setState(diffOpened);

    this.fetchPageRevisionBody(revision);
    this.fetchPageRevisionBody(this.getPreviousRevision(revision));
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
