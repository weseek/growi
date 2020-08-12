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
      hoge: 'huga',
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PageHistoryContainer';
  }

}
