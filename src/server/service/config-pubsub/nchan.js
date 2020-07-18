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
    this.isConnecting = false;

    this.client = null;
    this.connection = null;
  }

  /**
   * @inheritdoc
   */
  shouldResubscribe() {
    if (this.connection != null && this.connection.connected) {
      return false;
    }

    return !this.isConnecting;
  }

  /**
   * @inheritdoc
   */
  subscribe(forceReconnect = false) {
    if (forceReconnect) {
      if (this.connection != null && this.connection.connected) {
        this.connection.close();
      }
    }

    // init client
    if (this.client == null) {
      this.initClient();
    }

    if (this.shouldResubscribe()) {
      logger.info('The connection to config pubsub server is offline. Try to reconnect...');
    }

    // connect
    this.isConnecting = true;
    const url = this.constructUrl(this.subscribePath).toString();
    this.client.connect(url.toString());
  }

  /**
   * @inheritdoc
   */
  async publish(message) {
    logger.debug('Publish message', message);
    const url = this.constructUrl(this.publishPath).toString();
    return axios.post(url, message);
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

  constructUrl(basepath) {
    const pathname = this.channelId == null
      ? basepath //                                 /pubsub
      : path.join(basepath, this.channelId); //     /pubsub/my-channel-id

    return new URL(pathname, this.uri);
  }

  initClient() {
    const client = new WebSocketClient();

    client.on('connectFailed', (error) => {
      logger.warn(`Connect Error: ${error.toString()}`);
      this.isConnecting = false;
    });

    client.on('connect', (connection) => {
      this.isConnecting = false;
      this.connection = connection;

      logger.info('WebSocket client connected');

      connection.on('error', (error) => {
        this.isConnecting = false;
        logger.error(`Connection Error: ${error.toString()}`);
      });
      connection.on('close', () => {
        logger.info('WebSocket connection closed');
      });

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
