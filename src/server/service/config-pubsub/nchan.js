const logger = require('@alias/logger')('growi:service:config-pubsub:nchan');

const path = require('path');
const axios = require('axios');
const WebSocketClient = require('websocket').client;

const ConfigPubsubMessage = require('../../models/vo/config-pubsub-message');
const ConfigPubsubDelegator = require('./base');


class NchanDelegator extends ConfigPubsubDelegator {

  constructor(uri, publishPath, subscribePath, channelId) {
    super(uri);

    this.publishPath = publishPath;
    this.subscribePath = subscribePath;

    this.channelId = channelId;
    this.isConnecting = false;

    /**
     * A list of ConfigPubsubHandler instance
     */
    this.handlableList = [];

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

    if (this.client != null && this.shouldResubscribe()) {
      logger.info('The connection to config pubsub server is offline. Try to reconnect...');
    }

    // init client
    if (this.client == null) {
      this.initClient();
    }

    // connect
    this.isConnecting = true;
    const url = this.constructUrl(this.subscribePath).toString();
    logger.debug(`Subscribe to ${url}`);
    this.client.connect(url.toString());
  }

  /**
   * @inheritdoc
   */
  async publish(configPubsubMessage) {
    await super.publish(configPubsubMessage);

    const url = this.constructUrl(this.publishPath).toString();

    logger.debug('Publish message', configPubsubMessage, `to ${url}`);

    return axios.post(url, JSON.stringify(configPubsubMessage));
  }

  /**
   * @inheritdoc
   */
  addMessageHandler(handlable) {
    super.addMessageHandler(handlable);
    this.registerMessageHandlerToConnection(handlable);
  }

  /**
   * @inheritdoc
   */
  removeMessageHandler(handlable) {
    super.removeMessageHandler(handlable);
    this.subscribe(true);
  }

  registerMessageHandlerToConnection(handlable) {
    if (this.connection != null) {
      this.connection.on('message', (messageObj) => {
        this.handleMessage(messageObj, handlable);
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
      this.handlableList.forEach(handler => this.registerMessageHandlerToConnection(handler));
    });

    this.client = client;
  }

  /**
   * Handle message string with the specified ConfigPubsubHandler
   *
   * @see https://github.com/theturtle32/WebSocket-Node/blob/1f7ffba2f7a6f9473bcb39228264380ce2772ba7/docs/WebSocketConnection.md#message
   *
   * @param {object} message WebSocket-Node message object
   * @param {ConfigPubsubHandler} handlable
   */
  handleMessage(message, handlable) {
    if (message.type !== 'utf8') {
      logger.warn('Only utf8 message is supported.');
    }

    try {
      const configPubsubMessage = ConfigPubsubMessage.parse(message.utf8Data);

      // check uid
      if (configPubsubMessage.publisherUid === this.uid) {
        logger.debug(`Skip processing by ${handlable.constructor.name} because this message is sent by the publisher itself:`, `from ${this.uid}`);
        return;
      }

      // check shouldHandleConfigPubsubMessage
      const shouldHandle = handlable.shouldHandleConfigPubsubMessage(configPubsubMessage);
      logger.debug(`${handlable.constructor.name}.shouldHandleConfigPubsubMessage(`, configPubsubMessage, `) => ${shouldHandle}`);

      if (shouldHandle) {
        handlable.handleConfigPubsubMessage(configPubsubMessage);
      }
    }
    catch (err) {
      logger.warn('Could not handle a message: ', err.message);
    }
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
  const channelId = configManager.getConfig('crowi', 'configPubsub:nchan:channelId');

  return new NchanDelegator(uri, publishPath, subscribePath, channelId);
};
