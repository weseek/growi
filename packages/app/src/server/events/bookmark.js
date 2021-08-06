// var debug = require('debug')('crowi:events:page')
const util = require('util');
const events = require('events');

function BookmarkEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(BookmarkEvent, events.EventEmitter);

BookmarkEvent.prototype.onCreate = function(bookmark) {};
BookmarkEvent.prototype.onDelete = function(bookmark) {};

module.exports = BookmarkEvent;
