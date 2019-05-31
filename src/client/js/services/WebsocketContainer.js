import { Container } from 'unstated';

/**
 * Service container related to options for WebSocket
 * @extends {Container} unstated Container
 */
export default class WebsocketContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    this.socketClientId = Math.floor(Math.random() * 100000);

    this.state = {
    };
  }

  getCocketClientId() {
    return this.socketClientId;
  }

}
