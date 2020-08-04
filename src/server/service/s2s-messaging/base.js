const logger = require('@alias/logger')('growi:service:s2s-messaging:base');

const S2sMessageHandlable = require('./handlable');

class S2sMessagingServiceDelegator {

  constructor(uri) {
    this.uid = Math.floor(Math.random() * 100000);
    this.uri = uri;

    if (uri == null) {
      throw new Error('uri must be set');
    }

    this.handlableList = [];
  }

  shouldResubscribe() {
    throw new Error('implement this');
  }

  subscribe(forceReconnect) {
    throw new Error('implement this');
  }

  /**
   * Publish message
   * @param {S2sMessage} s2sMessage
   */
  async publish(s2sMessage) {
    s2sMessage.setPublisherUid(this.uid);
  }

  /**
   * Add message handler
   * @param {S2sMessageHandlable} handlable
   */
  addMessageHandler(handlable) {
    if (!(handlable instanceof S2sMessageHandlable)) {
      logger.warn('Unsupported instance');
      logger.debug('Unsupported instance: ', handlable);
      return;
    }

    this.handlableList.push(handlable);
  }

  /**
   * Remove message handler
   * @param {S2sMessageHandlable} handlable
   */
  removeMessageHandler(handlable) {
    if (!(handlable instanceof S2sMessageHandlable)) {
      logger.warn('Unsupported instance');
      logger.debug('Unsupported instance: ', handlable);
      return;
    }

    this.handlableList = this.handlableList.filter(h => h !== handlable);
  }

}

module.exports = S2sMessagingServiceDelegator;
