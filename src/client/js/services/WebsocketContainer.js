import { Container } from 'unstated';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

/**
 * Service container related to options for WebSocket
 * @extends {Container} unstated Container
 */
export default class WebsocketContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    this.socket =  new W3CWebSocket('ws://localhost:8080/', 'echo-protocol');
    this.socketClientId = Math.floor(Math.random() * 100000);

    this.state = {
    };

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
