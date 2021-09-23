import Crowi from '../crowi';
import { InAppNotification } from '~/server/models/in-app-notification';
import { Activity } from '~/server/models/activity';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:inAppNotification');


class InAppNotificationService {

  crowi!: any;

  socketIoService!: any;

  commentEvent!: any;


  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.socketIoService = crowi.socketIoService;
    this.commentEvent = crowi.event('comment');

    // init
    this.initCommentEvent();
  }


  initCommentEvent(): void {
    // update
    this.commentEvent.on('update', (user) => {
      if (this.socketIoService.isInitialized) {
        this.socketIoService.getDefaultSocket().emit('comment updated', { user });
      }
    });

  }

}

module.exports = InAppNotificationService;
