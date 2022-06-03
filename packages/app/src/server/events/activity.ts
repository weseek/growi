import { IPage } from '~/interfaces/page';
import { ActivityDocument } from '~/server/models/activity';
import loggerFactory from '~/utils/logger';

import Crowi from '../crowi';

const logger = loggerFactory('growi:events:activity');

const events = require('events');
const util = require('util');

function ActivityEvent(crowi: Crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(ActivityEvent, events.EventEmitter);

ActivityEvent.prototype.onUpdate = async function(activity: ActivityDocument, target: IPage) {
  try {
    await this.crowi.inAppNotificationService.createInAppNotification(activity, target);
  }
  catch (err) {
    logger.error('Create InAppNotification failed', err);
  }
};

module.exports = ActivityEvent;
