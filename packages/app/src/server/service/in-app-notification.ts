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
    // create
    this.commentEvent.on('create', async(savedComment) => {
      this.commentEvent.onCreate();

      try {
        const activityLog = await Activity.createByPageComment(savedComment);
        logger.info('Activity created', activityLog);
      }
      catch (err) {
        throw err;
      }
    });

    // update
    this.commentEvent.on('update', (user) => {
      this.commentEvent.onUpdate();

      if (this.socketIoService.isInitialized) {
        this.socketIoService.getDefaultSocket().emit('comment updated', { user });
      }

    });

    // remove
    this.commentEvent.on('remove', async(comment) => {
      this.commentEvent.onRemove();

      try {
        await Activity.removeByPageCommentDelete(comment);
      }
      catch (err) {
        logger.error(err);
      }
    });

  }

  removeActivity = async function(activity) {
    const { _id, target, action } = activity;
    const query = { target, action };
    const parameters = { $pull: { activities: _id } };

    const result = await InAppNotification.updateMany(query, parameters);

    await InAppNotification.removeEmpty();

    return result;
  };

}

module.exports = InAppNotificationService;
