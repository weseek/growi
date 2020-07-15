const logger = require('@alias/logger')('growi:service:config-pubsub:nchan');

const ConfigPubsubDelegator = require('./base');


class NchanDelegator extends ConfigPubsubDelegator {

  constructor(uri, publishPath, subscribePath) {
    super(uri);

    this.publishPath = publishPath;
    this.subscribePath = subscribePath;
  }

  /**
   * @inheritdoc
   */
  connect() {
    // TODO implement
  }

}

module.exports = function(crowi) {
  const { configManager } = crowi;

  const uri = configManager.getConfig('crowi', 'app:nchanUri');

  // when nachan server URI is not set
  if (uri == null) {
    logger.warn('NCHAN_URI is not specified.');
    return;
  }

  const publishPath = configManager.getConfig('crowi', 'configPubsub:nchan:publishPath');
  const subscribePath = configManager.getConfig('crowi', 'configPubsub:nchan:subscribePath');

  return new NchanDelegator(uri, publishPath, subscribePath);
};
