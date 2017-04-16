var debug = require('debug')('crowi:events:page');
var util = require('util');
var events = require('events');

function PageEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(PageEvent, events.EventEmitter);

PageEvent.prototype.onCreate = function(page, user) {
  var User = this.crowi.model('User');
  var Page = this.crowi.model('Page');

};
PageEvent.prototype.onUpdate = function(page, user) {
  var User = this.crowi.model('User');
  var Page = this.crowi.model('Page');
};

module.exports = PageEvent;
