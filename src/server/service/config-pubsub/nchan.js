const logger = require('@alias/logger')('growi:service:config-pubsub:nchan');

// const io = require('socket.io-client');
const WebSocketClient = require('websocket').client;

const ConfigPubsubDelegator = require('./base');


class NchanDelegator extends ConfigPubsubDelegator {

  constructor(uri, publishPath, subscribePath) {
    super(uri);

    this.publishPath = publishPath;
    this.subscribePath = subscribePath;

    this.socket = null;
  }

  /**
   * @inheritdoc
   */
  subscribe() {
    if (this.socket == null) {
      const client = new WebSocketClient();

      client.on('connectFailed', (error) => {
        console.log(`Connect Error: ${error.toString()}`);
      });

      client.on('connect', (connection) => {
        console.log('WebSocket Client Connected');
        connection.on('error', (error) => {
          console.log(`Connection Error: ${error.toString()}`);
        });
        connection.on('close', () => {
          console.log('echo-protocol Connection Closed');
        });
        connection.on('message', (message) => {
          if (message.type === 'utf8') {
            console.log(`Received: '${message.utf8Data}'`);
          }
        });
      });

      const websocketUri = new URL(this.subscribePath, this.uri);
      client.connect(websocketUri.toString());

      this.client = client;


      // this.socket = io(this.uri, { path: this.subscribePath, transports: ['websocket'] });

      // this.socket.on('connect', (date) => {
      //   console.log('connected', this.url, { path: this.subscribePath });
      // });
      // this.socket.on('connect_error', (error) => {
      //   console.log('connect error', error);
      // });
      // this.socket.on('connect_timeout', (error) => {
      //   console.log('connect timeout', error);
      // });
      // this.socket.on('update', (date) => {
      //   console.log('received update event', date);
      // });
    }

    // if (!this.socket.connected) {
    //   this.socket.connect();
    // }
  }

  /**
   * @inheritdoc
   */
  publish() {
    throw new Error('implement this');
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
