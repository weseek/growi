
import util from 'util';

const events = require('events');

function CommentEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(CommentEvent, events.EventEmitter);

CommentEvent.prototype.onCreate = function(comment) {};
CommentEvent.prototype.onUpdate = function(comment) {};
CommentEvent.prototype.onDelete = function(comment) {};

module.exports = CommentEvent;
