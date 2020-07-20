class ConfigPubsubDelegator {

  constructor(uri) {
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
    throw new Error('implement this');
  }

  /**
   * Add message handler
   * @param {ConfigPubsubHandlable} handlable
   */
  addMessageHandler(handlable) {
    throw new Error('implement this');
  }

}

module.exports = ConfigPubsubDelegator;
