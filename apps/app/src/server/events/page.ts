import { EventEmitter } from 'events';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:events:page');

class PageEvent extends EventEmitter {

  onCreate(page: any, user: any) {
    logger.debug('onCreate event fired');
  }

  onUpdate(page: any, user: any) {
    logger.debug('onUpdate event fired');
  }

  onCreateMany(pages: any[], user: any) {
    logger.debug('onCreateMany event fired');
  }

  onAddSeenUsers(pages: any[], user: any) {
    logger.debug('onAddSeenUsers event fired');
  }

}

export default PageEvent;
