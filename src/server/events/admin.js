const util = require('util');
const events = require('events');

function AdminEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(AdminEvent, events.EventEmitter);

module.exports = AdminEvent;
