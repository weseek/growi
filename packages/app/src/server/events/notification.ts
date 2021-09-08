const debug = require('debug')('growi:events:page');
const util = require('util');
const events = require('events');

function NotificationEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(NotificationEvent, events.EventEmitter);

NotificationEvent.prototype.onUpdate = function(page, user) {
  debug('onUpdate event fired');
};


module.exports = NotificationEvent;
