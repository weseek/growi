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

  async publish() {
    throw new Error('implement this');
  }

  addMessageHandler(handler) {
    throw new Error('implement this');
  }

}

module.exports = ConfigPubsubDelegator;
