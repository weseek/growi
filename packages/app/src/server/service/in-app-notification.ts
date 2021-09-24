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
  }


  emitSocketIo = async(user) => {
    if (this.socketIoService.isInitialized) {
      console.log('socketIoServiceHoge');

      await this.socketIoService.getDefaultSocket().emit('comment updated', { user });
    }
  }

}

module.exports = InAppNotificationService;
