const util = require('util');
const events = require('events');

function TagEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(TagEvent, events.EventEmitter);

TagEvent.prototype.onUpdate = function(tag) { };

module.exports = TagEvent;
