class ConfigPubsubDelegator {

  constructor(uri) {
    this.uri = uri;

    if (uri == null) {
      throw new Error('uri must be set');
    }
  }

  connect() {
    throw new Error('implement this');
  }

}

module.exports = ConfigPubsubDelegator;
