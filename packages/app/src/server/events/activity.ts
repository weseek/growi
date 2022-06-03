import Crowi from '../crowi';


const events = require('events');
const util = require('util');

function ActivityEvent(crowi: Crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(ActivityEvent, events.EventEmitter);


module.exports = ActivityEvent;
