const util = require('util');
const events = require('events');

function SearchEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(SearchEvent, events.EventEmitter);

module.exports = SearchEvent;
