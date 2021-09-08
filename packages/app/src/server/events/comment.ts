import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:events:comment');

const util = require('util');
const events = require('events');

function CommentEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}

util.inherits(CommentEvent, events.EventEmitter);


CommentEvent.prototype.onUpdate = function() {
  logger.info('onUpdate event fired');
};


module.exports = CommentEvent;
