import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:PageHistoryContainer');


/**
 * Service container for personal settings page (PageHistory.jsx)
 * @extends {Container} unstated Container
 */
export default class PageHistoryContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      isLoaded: false,
      hoge: 'huga',

      revisions: [],
      diffOpened: null,
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PageHistoryContainer';
  }

  async retrieveRevisions({ pageId, shareLinkId }) {

    if (!pageId) {
      return;
    }

    const res = await this.appContainer.apiv3Get('/revisions/list', { pageId, share_link_id: shareLinkId });
    const rev = res.data.revisions;
    const diffOpened = {};
    const lastId = rev.length - 1;

    res.data.revisions.forEach((revision, i) => {
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
    this.setState({ isLoaded: true });

    // load 0, and last default
    // if (rev[0]) {
    //   fetchPageRevisionBody(rev[0]);
    // }
    // if (rev[1]) {
    //   fetchPageRevisionBody(rev[1]);
    // }
    // if (lastId !== 0 && lastId !== 1 && rev[lastId]) {
    //   fetchPageRevisionBody(rev[lastId]);
    // }

    return;
  }

}
