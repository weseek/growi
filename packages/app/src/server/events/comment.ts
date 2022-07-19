import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:events:comment');

const events = require('events');
const util = require('util');


function CommentEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(CommentEvent, events.EventEmitter);

CommentEvent.prototype.onCreate = function(comment) {
  logger.info('onCreate comment event fired');
};
CommentEvent.prototype.onUpdate = function(comment) {
  logger.info('onUpdate comment event fired');
};
CommentEvent.prototype.onDelete = function(comment) {
  logger.info('onDelete comment event fired');
};

module.exports = CommentEvent;
