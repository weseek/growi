import { Container } from 'unstated';

import io from 'socket.io-client';

/**
 * Service container related to options for WebSocket
 * @extends {Container} unstated Container
 */
export default class WebsocketContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    this.socket = io();
    this.socketClientId = Math.floor(Math.random() * 100000);

    this.state = {
    };

  }

  getWebSocket() {
    return this.socket;
  }

  getCocketClientId() {
    return this.socketClientId;
  }

}
