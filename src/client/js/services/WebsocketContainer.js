import { Container } from 'unstated';

import ReconnectingWebSocket from 'reconnecting-websocket';

/**
 * Service container related to options for WebSocket
 * @extends {Container} unstated Container
 */
export default class WebsocketContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    this.state = {
    };

    this.socket = null;

    this.initSocket();
  }

  initSocket() {
    this.socket = new ReconnectingWebSocket();
    this.socketClientId = Math.floor(Math.random() * 100000);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'WebsocketContainer';
  }

  getWebSocket() {
    return this.socket;
  }

  getSocketClientId() {
    return this.socketClientId;
  }

}
