const logger = require('@alias/logger')('growi:service:config-pubsub:nchan');

const path = require('path');
const axios = require('axios');
const WebSocketClient = require('websocket').client;

const ConfigPubsubDelegator = require('./base');


class NchanDelegator extends ConfigPubsubDelegator {

  constructor(uri, publishPath, subscribePath, channelId) {
    super(uri);

    this.publishPath = publishPath;
    this.subscribePath = subscribePath;

    this.channelId = channelId;
    this.messageHandlers = [];

    this.client = null;
    this.connection = null;
  }

  /**
   * @inheritdoc
   */
  subscribe(forceReconnect) {
    if (forceReconnect) {
      if (this.connection != null && this.connection.connected) {
        this.connection.close();
      }
    }

    const pathname = this.channelId == null
      ? this.subscribePath //                               /sub
      : path.join(this.subscribePath, this.channelId); //   /sub/my-channel-id

    const subscribeUri = new URL(pathname, this.uri);

    // init client and connect
    if (this.client == null) {
      this.initClient();
      this.client.connect(subscribeUri.toString());
    }

    // reconnect
    if (this.connection != null && !this.connection.connected) {
      this.client.connect(subscribeUri.toString());
    }
  }

  /**
   * @inheritdoc
   */
  async publish(message) {
    const pathname = this.channelId == null
      ? this.publishPath //                                 /pub
      : path.join(this.subscribePath, this.channelId); //   /pub/my-channel-id

    const publishUri = new URL(pathname, this.uri);

    logger.debug('Publish message', message);

    return axios.post(publishUri.toString(), message);
  }

  /**
   * @inheritdoc
   */
  addMessageHandler(handler) {
    this.messageHandlers.push(handler);

    if (this.connection != null) {
      this.connection.on('message', (message) => {
        if (message.type === 'utf8') {
          handler(message.utf8Data);
        }
        else {
          logger.warn('Only utf8 message is supported.');
        }
      });
    }
  }

  initClient() {
    const client = new WebSocketClient();

    client.on('connectFailed', (error) => {
      logger.warn(`Connect Error: ${error.toString()}`);
    });

    client.on('connect', (connection) => {
      logger.info('WebSocket client connected');

      connection.on('error', (error) => {
        logger.error(`Connection Error: ${error.toString()}`);
      });
      connection.on('close', () => {
        logger.info('WebSocket connection closed');
      });

      this.connection = connection;

      // register all message handlers
      this.messageHandlers.forEach(handler => this.addMessageHandler(handler));
    });

    this.client = client;
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
