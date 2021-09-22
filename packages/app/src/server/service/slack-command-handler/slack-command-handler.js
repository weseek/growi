// Any slack command handler should inherit BaseSlackCommandHandler
class BaseSlackCommandHandler {

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * Handle /commands endpoint
   */
  handleCommand(growiCommand, client, body) { throw new Error('Implement this') }

  /**
   * Handle interactions
   */
  handleInteractions(client, payload, handlerMethodName) { throw new Error('Implement this') }

}

module.exports = BaseSlackCommandHandler;
