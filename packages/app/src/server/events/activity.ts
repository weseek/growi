import { IPage } from '~/interfaces/page';
import { ActivityDocument } from '~/server/models/activity';
import loggerFactory from '~/utils/logger';

import Crowi from '../crowi';

const logger = loggerFactory('growi:events:activity');

const events = require('events');
const util = require('util');

function ActivityEvent(crowi: Crowi) {
  this.crowi = crowi;
  this.inAppNotificationService = crowi.inAppNotificationService;

  events.EventEmitter.call(this);
}

ActivityEvent.prototype.onUpdate = async function(activity: ActivityDocument, target: IPage) {
  try {
    await this.inAppNotificationService.createInAppNotification(activity, target);
  }
  catch (err) {
    logger.error('Create InAppNotification failed', err);
  }
};

util.inherits(ActivityEvent, events.EventEmitter);


module.exports = ActivityEvent;
