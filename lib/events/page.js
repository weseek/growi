var debug = require('debug')('growi:events:page');
var util = require('util');
var events = require('events');

function PageEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(PageEvent, events.EventEmitter);

PageEvent.prototype.onCreate = function(page, user) {
  debug('onCreate event fired');
};
PageEvent.prototype.onUpdate = function(page, user) {
  debug('onUpdate event fired');
};

module.exports = PageEvent;
