const logger = require('@alias/logger')('growi:service:config-pubsub:base');

const ConfigPubsubMessageHandlable = require('../config-pubsub/handlable');

class ConfigPubsubDelegator {

  constructor(uri) {
    this.uid = Math.floor(Math.random() * 100000);
    this.uri = uri;

    if (uri == null) {
      throw new Error('uri must be set');
    }
  }

  shouldResubscribe() {
    throw new Error('implement this');
  }

  subscribe(forceReconnect) {
    throw new Error('implement this');
  }

  /**
   * Publish message
   * @param {ConfigPubsubMessage} configPubsubMessage
   */
  async publish(configPubsubMessage) {
    configPubsubMessage.setPublisherUid(this.uid);
  }

  /**
   * Add message handler
   * @param {ConfigPubsubMessageHandlable} handlable
   */
  addMessageHandler(handlable) {
    if (!(handlable instanceof ConfigPubsubMessageHandlable)) {
      logger.warn('Unsupported instance');
      logger.debug('Unsupported instance: ', handlable);
      return;
    }

    this.handlableList.push(handlable);
  }

  /**
   * Remove message handler
   * @param {ConfigPubsubMessageHandlable} handlable
   */
  removeMessageHandler(handlable) {
    if (!(handlable instanceof ConfigPubsubMessageHandlable)) {
      logger.warn('Unsupported instance');
      logger.debug('Unsupported instance: ', handlable);
      return;
    }

    this.handlableList = this.handlableList.filter(h => h !== handlable);
  }

}

module.exports = ConfigPubsubDelegator;
