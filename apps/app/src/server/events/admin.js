const events = require('events');
const util = require('util');

/** @param {import('~/server/crowi').default} crowi Crowi instance */
function AdminEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(AdminEvent, events.EventEmitter);

module.exports = AdminEvent;
