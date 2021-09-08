import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:events:notification');

const util = require('util');
const events = require('events');

function NotificationEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}

util.inherits(NotificationEvent, events.EventEmitter);


NotificationEvent.prototype.onUpdate = function(user) {
  logger.info('onUpdate event fired');
};


module.exports = NotificationEvent;
