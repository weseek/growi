import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:events:page');

const util = require('util');
const events = require('events');

function PageEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(PageEvent, events.EventEmitter);

PageEvent.prototype.onCreate = function(page, user) {
  logger.debug('onCreate event fired');
};
PageEvent.prototype.onUpdate = function(page, user) {
  logger.debug('onUpdate event fired');
};

module.exports = PageEvent;
