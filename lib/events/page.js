var debug = require('debug')('crowi:events:page');
var util = require('util');
var events = require('events');
var sprintf = require('sprintf');

function PageEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(PageEvent, events.EventEmitter);

PageEvent.prototype.onUpdated = function(page) {
  var User = this.crowi.model('User');
  var Page = this.crowi.model('Page');

};

module.exports = PageEvent;
